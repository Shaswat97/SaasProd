import { getTenantPrisma } from "@/lib/tenant-prisma";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { getDefaultCompanyId } from "@/lib/tenant";
import { buildProcurementPlan, computeAvailabilitySummary } from "@/lib/sales-order";
import { requirePermission } from "@/lib/permissions";
import { getActorFromRequest, recordActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const prisma = await getTenantPrisma();
    if (!prisma) return jsonError("Tenant not found", 404);
    const companyId = await getDefaultCompanyId(prisma);
    let order = await prisma.salesOrder.findFirst({
      where: { id: params.id, companyId, deletedAt: null },
      include: {
        customer: true,
        lines: { include: { sku: true } },
        deliveries: { include: { line: { include: { sku: true } } } },
        invoices: { include: { lines: { include: { sku: true } }, delivery: true, payments: { include: { payment: true } } } }
      }
    });

    if (!order) return jsonError("Sales order not found", 404);
    if (order.status === "DISPATCH" && order.deliveries.length > 0) {
      const allDelivered = order.lines.every((line) => (line.deliveredQty ?? 0) >= line.quantity);
      if (allDelivered) {
        order = await prisma.salesOrder.update({
          where: { id: order.id },
          data: { status: "DELIVERED" },
          include: {
            customer: true,
            lines: { include: { sku: true } },
            deliveries: { include: { line: { include: { sku: true } } } },
            invoices: { include: { lines: { include: { sku: true } }, delivery: true, payments: { include: { payment: true } } } }
          }
        });
      }
    }

    const orderLines = order.lines.map((line) => ({
      id: line.id,
      skuId: line.skuId,
      quantity: line.quantity,
      deliveredQty: line.deliveredQty
    }));

    let availability;
    let procurementPlan;
    try {
      availability = await computeAvailabilitySummary({
        companyId,
        lines: orderLines,
        excludeSoLineIds: order.lines.map((line) => line.id)
      });

      procurementPlan = await buildProcurementPlan({
        companyId,
        lines: orderLines,
        availability,
        excludeSoLineIds: order.lines.map((line) => line.id)
      });
    } catch (calcError) {
      console.error(`[sales-orders/${params.id}] detail metrics failed`, calcError);
      availability = { finished: [], raw: [], lines: [] };
      procurementPlan = { vendorPlans: [], skipped: [] };
    }

    return jsonOk({ ...order, availability, procurementPlan });
  } catch (error) {
    console.error(`[sales-orders/${params.id}] GET failed`, error);
    return jsonError("Failed to load sales order details", 500);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const guard = await requirePermission(request, "sales.delete");
    if (guard.error) return guard.error;
    const prisma = guard.prisma;
    if (!prisma) return jsonError("Tenant not found", 404);
    const companyId = guard.context?.companyId ?? (await getDefaultCompanyId(prisma));

    const order = await prisma.salesOrder.findFirst({
      where: { id: params.id, companyId, deletedAt: null },
      include: { lines: { select: { id: true } } }
    });
    if (!order) return jsonError("Sales order not found", 404);

    const lineIds = order.lines.map((l) => l.id);

    await prisma.$transaction(async (tx) => {
      // 1. Release stock reservations
      await tx.stockReservation.updateMany({
        where: { soLineId: { in: lineIds }, releasedAt: null },
        data: { releasedAt: new Date(), quantity: 0 }
      });

      // 2. Remove PO allocations linked to this order's lines
      await tx.purchaseOrderAllocation.deleteMany({
        where: { soLineId: { in: lineIds } }
      });

      // 3. Soft-delete the order
      await tx.salesOrder.update({
        where: { id: order.id },
        data: { deletedAt: new Date() }
      });
    });

    const { actorName, actorEmployeeId } = guard.context
      ? { actorName: guard.context.actorName, actorEmployeeId: guard.context.actorEmployeeId }
      : getActorFromRequest(request);

    await recordActivity({
      companyId,
      actorName,
      actorEmployeeId,
      action: "DELETE",
      entityType: "Sales Order",
      entityId: order.id,
      summary: `Deleted sales order ${order.soNumber ?? order.id}. Released ${lineIds.length} line reservations and PO allocations.`
    });

    return jsonOk({ deleted: true });
  } catch (error) {
    console.error(`[sales-orders/${params.id}] DELETE failed`, error);
    return jsonError("Failed to delete sales order", 500);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const guard = await requirePermission(request, "sales.edit");
    if (guard.error) return guard.error;
    const prisma = guard.prisma;
    if (!prisma) return jsonError("Tenant not found", 404);
    const companyId = guard.context?.companyId ?? (await getDefaultCompanyId(prisma));

    // Only Techno can edit sales orders
    const { actorName, actorEmployeeId, actorEmployeeCode } = getActorFromRequest(request);
    const isTechno = actorEmployeeCode?.toLowerCase() === "techno";
    if (!isTechno) return jsonError("Only Techno admin can edit sales orders", 403);

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonError("Invalid JSON payload");
    }

    const { lines, notes } = payload as {
      lines?: Array<{ id: string; quantity?: number; unitPrice?: number }>;
      notes?: string;
    };

    const order = await prisma.salesOrder.findFirst({
      where: { id: params.id, companyId, deletedAt: null },
      include: { lines: true }
    });
    if (!order) return jsonError("Sales order not found", 404);

    await prisma.$transaction(async (tx) => {
      // Update header fields
      if (notes !== undefined) {
        await tx.salesOrder.update({
          where: { id: order.id },
          data: { notes }
        });
      }

      // Update line quantities and prices
      if (lines && lines.length > 0) {
        for (const lineEdit of lines) {
          const existing = order.lines.find((l) => l.id === lineEdit.id);
          if (!existing) continue;
          const updateData: Record<string, unknown> = {};
          if (lineEdit.quantity !== undefined && lineEdit.quantity > 0) {
            updateData.quantity = lineEdit.quantity;
          }
          if (lineEdit.unitPrice !== undefined && lineEdit.unitPrice >= 0) {
            updateData.unitPrice = lineEdit.unitPrice;
          }
          if (Object.keys(updateData).length > 0) {
            await tx.salesOrderLine.update({
              where: { id: lineEdit.id },
              data: updateData
            });
          }
        }
      }
    });

    await recordActivity({
      companyId,
      actorName,
      actorEmployeeId,
      action: "UPDATE",
      entityType: "Sales Order",
      entityId: order.id,
      summary: `Techno edited sales order ${order.soNumber ?? order.id}.`
    });

    return jsonOk({ updated: true });
  } catch (error) {
    console.error(`[sales-orders/${params.id}] PUT failed`, error);
    return jsonError("Failed to update sales order", 500);
  }
}
