import { getTenantPrisma } from "@/lib/tenant-prisma";
import { jsonError } from "@/lib/api-helpers";
import { getDefaultCompanyId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
    const prisma = await getTenantPrisma();
    if (!prisma) return jsonError("Tenant not found", 404);
    const companyId = await getDefaultCompanyId(prisma);

    try {
        // ── Master Data ───────────────────────────────────────────
        const [
            roles,
            employees,
            employeeRoles,
            warehouses,
            zones,
            vendors,
            customers,
            skus,
            vendorSkus,
            machines,
            machineSkus,
            boms,
            bomLines,
            routings,
            routingSteps,
            salesPriceLists,
            salesPriceListLines
        ] = await Promise.all([
            prisma.role.findMany({ where: { companyId, deletedAt: null } }),
            prisma.employee.findMany({ where: { companyId, deletedAt: null } }),
            prisma.employeeRole.findMany({ where: { employee: { companyId } } }),
            prisma.warehouse.findMany({ where: { companyId, deletedAt: null } }),
            prisma.zone.findMany({ where: { companyId, deletedAt: null } }),
            prisma.vendor.findMany({ where: { companyId, deletedAt: null } }),
            prisma.customer.findMany({ where: { companyId, deletedAt: null } }),
            prisma.sku.findMany({ where: { companyId, deletedAt: null } }),
            prisma.vendorSku.findMany({ where: { companyId } }),
            prisma.machine.findMany({ where: { companyId, deletedAt: null } }),
            prisma.machineSku.findMany({ where: { companyId, deletedAt: null } }),
            prisma.bom.findMany({ where: { companyId, deletedAt: null } }),
            prisma.bomLine.findMany({ where: { bom: { companyId }, deletedAt: null } }),
            prisma.routing.findMany({ where: { companyId, deletedAt: null } }),
            prisma.routingStep.findMany({ where: { routing: { companyId } } }),
            prisma.salesPriceList.findMany({ where: { companyId, deletedAt: null } }),
            prisma.salesPriceListLine.findMany({ where: { companyId } })
        ]);

        // ── Transactional Data ────────────────────────────────────
        const [
            purchaseOrders,
            purchaseOrderLines,
            purchaseOrderAllocations,
            goodsReceipts,
            goodsReceiptLines,
            salesOrders,
            salesOrderLines,
            salesOrderDeliveries,
            salesInvoices,
            salesInvoiceLines,
            salesPayments,
            salesPaymentAllocations,
            scrapSales,
            scrapSaleLines,
            vendorBills,
            vendorBillLines,
            vendorPayments,
            vendorPaymentAllocations
        ] = await Promise.all([
            prisma.purchaseOrder.findMany({ where: { companyId, deletedAt: null } }),
            prisma.purchaseOrderLine.findMany({ where: { purchaseOrder: { companyId } } }),
            prisma.purchaseOrderAllocation.findMany({ where: { poLine: { purchaseOrder: { companyId } } } }),
            prisma.goodsReceipt.findMany({ where: { companyId } }),
            prisma.goodsReceiptLine.findMany({ where: { receipt: { companyId } } }),
            prisma.salesOrder.findMany({ where: { companyId, deletedAt: null } }),
            prisma.salesOrderLine.findMany({ where: { salesOrder: { companyId } } }),
            prisma.salesOrderDelivery.findMany({ where: { companyId } }),
            prisma.salesInvoice.findMany({ where: { companyId } }),
            prisma.salesInvoiceLine.findMany({ where: { invoice: { companyId } } }),
            prisma.salesPayment.findMany({ where: { companyId } }),
            prisma.salesPaymentAllocation.findMany({ where: { companyId } }),
            prisma.scrapSale.findMany({ where: { companyId } }),
            prisma.scrapSaleLine.findMany({ where: { scrapSale: { companyId } } }),
            prisma.vendorBill.findMany({ where: { companyId } }),
            prisma.vendorBillLine.findMany({ where: { bill: { companyId } } }),
            prisma.vendorPayment.findMany({ where: { companyId } }),
            prisma.vendorPaymentAllocation.findMany({ where: { companyId } })
        ]);

        // ── Production & Stock ────────────────────────────────────
        const [
            productionLogs,
            productionLogConsumptions,
            productionLogCrews,
            productionLogAudits,
            rawMaterialBatches,
            stockReservations,
            stockLedgers,
            stockBalances,
            activityLogs,
            employeeAttendances
        ] = await Promise.all([
            prisma.productionLog.findMany({ where: { companyId, deletedAt: null } }),
            prisma.productionLogConsumption.findMany({ where: { companyId } }),
            prisma.productionLogCrew.findMany({ where: { companyId } }),
            prisma.productionLogAudit.findMany({ where: { companyId } }),
            prisma.rawMaterialBatch.findMany({ where: { companyId } }),
            prisma.stockReservation.findMany({ where: { companyId } }),
            prisma.stockLedger.findMany({ where: { companyId } }),
            prisma.stockBalance.findMany({ where: { companyId } }),
            prisma.activityLog.findMany({ where: { companyId }, orderBy: { createdAt: "asc" } }),
            prisma.employeeAttendance.findMany({ where: { companyId } })
        ]);

        const snapshot = {
            _meta: {
                exportedAt: new Date().toISOString(),
                version: 1,
                companyId
            },
            // Master
            roles,
            employees,
            employeeRoles,
            warehouses,
            zones,
            vendors,
            customers,
            skus,
            vendorSkus,
            machines,
            machineSkus,
            boms,
            bomLines,
            routings,
            routingSteps,
            salesPriceLists,
            salesPriceListLines,
            // Orders
            purchaseOrders,
            purchaseOrderLines,
            purchaseOrderAllocations,
            goodsReceipts,
            goodsReceiptLines,
            salesOrders,
            salesOrderLines,
            salesOrderDeliveries,
            salesInvoices,
            salesInvoiceLines,
            salesPayments,
            salesPaymentAllocations,
            scrapSales,
            scrapSaleLines,
            vendorBills,
            vendorBillLines,
            vendorPayments,
            vendorPaymentAllocations,
            // Production & Stock
            productionLogs,
            productionLogConsumptions,
            productionLogCrews,
            productionLogAudits,
            rawMaterialBatches,
            stockReservations,
            stockLedgers,
            stockBalances,
            employeeAttendances,
            activityLogs
        };

        const json = JSON.stringify(snapshot, null, 2);
        const dateStr = new Date().toISOString().slice(0, 10);

        return new Response(json, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="snapshot-${dateStr}.json"`
            }
        });
    } catch (error: any) {
        return jsonError(error.message ?? "Failed to export snapshot");
    }
}
