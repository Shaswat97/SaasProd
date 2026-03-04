import { z } from "zod";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { jsonError, jsonOk, zodError } from "@/lib/api-helpers";
import { recordStockMovement } from "@/lib/stock-service";
import { getActorFromRequest, recordActivity } from "@/lib/activity";
import { getDefaultCompanyId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const adjustSchema = z.object({
    skuId: z.string().min(1, "SKU is required"),
    zoneId: z.string().min(1, "Zone is required"),
    countedQty: z.number().nonnegative("Counted quantity must be 0 or more"),
    referenceType: z.string().optional(),
    referenceId: z.string().optional(),
    notes: z.string().optional()
});

export async function POST(request: Request) {
    const prisma = await getTenantPrisma(request);
    if (!prisma) return jsonError("Tenant not found", 404);
    const companyId = await getDefaultCompanyId(prisma);

    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return jsonError("Invalid JSON payload");
    }

    const parsed = adjustSchema.safeParse(payload);
    if (!parsed.success) return zodError(parsed.error);

    const { actorName, actorEmployeeId, actorEmployeeCode } = getActorFromRequest(request);
    const isTechno = actorEmployeeCode?.toLowerCase() === "techno";

    if (!isTechno) {
        return jsonError("Only Techno admin can manually adjust stock.", 403);
    }

    const { skuId, zoneId, countedQty, referenceType, referenceId, notes } = parsed.data;

    const balance = await prisma.stockBalance.findUnique({
        where: {
            companyId_skuId_zoneId: { companyId, skuId, zoneId }
        },
        include: { sku: true, zone: true }
    });

    const currentQty = balance?.quantityOnHand ?? 0;
    const delta = countedQty - currentQty;

    if (delta === 0) {
        return jsonOk({ adjusted: false, message: "No change" });
    }

    try {
        const movement = await recordStockMovement({
            companyId,
            skuId,
            zoneId,
            quantity: Math.abs(delta),
            direction: delta > 0 ? "IN" : "OUT",
            movementType: "ADJUSTMENT",
            costPerUnit: balance?.costPerUnit ?? 0,
            referenceType: referenceType || "MANUAL_ADJUSTMENT",
            referenceId: referenceId || undefined,
            notes: notes
        });

        const skuLabel = balance?.sku ? `${balance.sku.code} · ${balance.sku.name}` : skuId;
        const zoneLabel = balance?.zone ? balance.zone.name : zoneId;

        await recordActivity({
            companyId,
            actorName,
            actorEmployeeId,
            action: "UPDATE",
            entityType: "Inventory",
            entityId: skuId,
            summary: `Techno manually adjusted ${skuLabel} in ${zoneLabel} from ${currentQty} to ${countedQty}.`
        });

        return jsonOk({ adjusted: true, movement });
    } catch (error: any) {
        return jsonError(error.message ?? "Failed to post manual adjustment", 400);
    }
}
