import { getTenantPrisma } from "@/lib/tenant-prisma";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { getDefaultCompanyId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/* ──────────────────────────────────────────────
 * POST /api/settings/import-snapshot
 * Accepts a JSON snapshot file, resets ALL data,
 * then re-inserts every record preserving original IDs.
 * ────────────────────────────────────────────── */
export async function POST(request: Request) {
    const prisma = await getTenantPrisma();
    if (!prisma) return jsonError("Tenant not found", 404);
    const companyId = await getDefaultCompanyId(prisma);

    let snap: any;
    try {
        snap = await request.json();
    } catch {
        return jsonError("Invalid JSON payload", 400);
    }

    if (!snap || !snap._meta) {
        return jsonError("Missing _meta in snapshot", 400);
    }

    const sourceCompanyId = snap._meta.companyId as string;

    /* Helper: replace the original companyId with the current tenant's companyId */
    function remap(records: any[]) {
        if (!records?.length) return [];
        return records.map((r: any) => {
            const copy = { ...r };
            if (copy.companyId === sourceCompanyId) copy.companyId = companyId;
            // Convert date strings back to Date objects for Prisma
            for (const key of Object.keys(copy)) {
                if (
                    typeof copy[key] === "string" &&
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(copy[key])
                ) {
                    copy[key] = new Date(copy[key]);
                }
            }
            return copy;
        });
    }

    try {
        await prisma.$transaction(
            async (tx) => {
                // ── 1. Clear all data (same order as reset-data) ────────
                await tx.activityLog.deleteMany({ where: { companyId } });
                await tx.appSession.deleteMany({ where: { companyId } });
                await tx.employeeAttendance.deleteMany({ where: { companyId } });

                await tx.productionLogCrew.deleteMany({ where: { companyId } });
                await tx.productionLogAudit.deleteMany({ where: { companyId } });
                await tx.productionLogConsumption.deleteMany({ where: { companyId } });
                await tx.productionLog.deleteMany({ where: { companyId } });
                await tx.scrapSaleLine.deleteMany({ where: { scrapSale: { companyId } } });
                await tx.scrapSale.deleteMany({ where: { companyId } });

                await tx.salesInvoiceLine.deleteMany({ where: { invoice: { companyId } } });
                await tx.salesPaymentAllocation.deleteMany({ where: { companyId } });
                await tx.salesInvoice.deleteMany({ where: { companyId } });
                await tx.salesPayment.deleteMany({ where: { companyId } });
                await tx.salesOrderDelivery.deleteMany({ where: { companyId } });

                await tx.vendorPaymentAllocation.deleteMany({ where: { companyId } });
                await tx.vendorBillLine.deleteMany({ where: { bill: { companyId } } });
                await tx.vendorBill.deleteMany({ where: { companyId } });
                await tx.vendorPayment.deleteMany({ where: { companyId } });

                await tx.purchaseOrderAllocation.deleteMany({
                    where: {
                        OR: [
                            { poLine: { purchaseOrder: { companyId } } },
                            { soLine: { salesOrder: { companyId } } }
                        ]
                    }
                });

                await tx.stockReservation.deleteMany({ where: { companyId } });
                await tx.rawMaterialBatch.deleteMany({ where: { companyId } });
                await tx.goodsReceiptLine.deleteMany({ where: { receipt: { companyId } } });
                await tx.goodsReceipt.deleteMany({ where: { companyId } });

                await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrder: { companyId } } });
                await tx.purchaseOrder.deleteMany({ where: { companyId } });
                await tx.salesOrderLine.deleteMany({ where: { salesOrder: { companyId } } });
                await tx.salesOrder.deleteMany({ where: { companyId } });

                await tx.stockLedger.deleteMany({ where: { companyId } });
                await tx.stockBalance.deleteMany({ where: { companyId } });

                await tx.vendorSku.deleteMany({ where: { companyId } });
                await tx.salesPriceListLine.deleteMany({ where: { companyId } });
                await tx.salesPriceList.deleteMany({ where: { companyId } });
                await tx.bomLine.deleteMany({ where: { bom: { companyId } } });
                await tx.bom.deleteMany({ where: { companyId } });
                await tx.routingStep.deleteMany({ where: { routing: { companyId } } });
                await tx.routing.deleteMany({ where: { companyId } });
                await tx.machineSku.deleteMany({ where: { companyId } });
                await tx.machine.deleteMany({ where: { companyId } });
                await tx.sku.deleteMany({ where: { companyId } });

                await tx.vendor.deleteMany({ where: { companyId } });
                await tx.customer.deleteMany({ where: { companyId } });
                await tx.employeeRole.deleteMany({ where: { employee: { companyId } } });
                await tx.employee.deleteMany({ where: { companyId } });
                await tx.role.deleteMany({ where: { companyId } });
                await tx.zone.deleteMany({ where: { companyId } });
                await tx.warehouse.deleteMany({ where: { companyId } });

                // ── 2. Insert snapshot data (FK-dependency order) ───────

                // Master entities (no FKs beyond companyId)
                const inserts: Array<{ model: string; data: any[] }> = [
                    { model: "role", data: remap(snap.roles) },
                    { model: "employee", data: remap(snap.employees) },
                    { model: "employeeRole", data: remap(snap.employeeRoles) },
                    { model: "warehouse", data: remap(snap.warehouses) },
                    { model: "zone", data: remap(snap.zones) },
                    { model: "vendor", data: remap(snap.vendors) },
                    { model: "customer", data: remap(snap.customers) },
                    { model: "sku", data: remap(snap.skus) },
                    { model: "vendorSku", data: remap(snap.vendorSkus) },
                    { model: "machine", data: remap(snap.machines) },
                    { model: "machineSku", data: remap(snap.machineSkus) },
                    { model: "bom", data: remap(snap.boms) },
                    { model: "bomLine", data: remap(snap.bomLines) },
                    { model: "routing", data: remap(snap.routings) },
                    { model: "routingStep", data: remap(snap.routingSteps) },
                    { model: "salesPriceList", data: remap(snap.salesPriceLists) },
                    { model: "salesPriceListLine", data: remap(snap.salesPriceListLines) },
                    // Transactional
                    { model: "purchaseOrder", data: remap(snap.purchaseOrders) },
                    { model: "purchaseOrderLine", data: remap(snap.purchaseOrderLines) },
                    { model: "salesOrder", data: remap(snap.salesOrders) },
                    { model: "salesOrderLine", data: remap(snap.salesOrderLines) },
                    { model: "purchaseOrderAllocation", data: remap(snap.purchaseOrderAllocations) },
                    { model: "goodsReceipt", data: remap(snap.goodsReceipts) },
                    { model: "goodsReceiptLine", data: remap(snap.goodsReceiptLines) },
                    { model: "rawMaterialBatch", data: remap(snap.rawMaterialBatches) },
                    { model: "salesOrderDelivery", data: remap(snap.salesOrderDeliveries) },
                    { model: "salesInvoice", data: remap(snap.salesInvoices) },
                    { model: "salesInvoiceLine", data: remap(snap.salesInvoiceLines) },
                    { model: "salesPayment", data: remap(snap.salesPayments) },
                    { model: "salesPaymentAllocation", data: remap(snap.salesPaymentAllocations) },
                    { model: "scrapSale", data: remap(snap.scrapSales) },
                    { model: "scrapSaleLine", data: remap(snap.scrapSaleLines) },
                    { model: "vendorBill", data: remap(snap.vendorBills) },
                    { model: "vendorBillLine", data: remap(snap.vendorBillLines) },
                    { model: "vendorPayment", data: remap(snap.vendorPayments) },
                    { model: "vendorPaymentAllocation", data: remap(snap.vendorPaymentAllocations) },
                    // Production
                    { model: "productionLog", data: remap(snap.productionLogs) },
                    { model: "productionLogConsumption", data: remap(snap.productionLogConsumptions) },
                    { model: "productionLogCrew", data: remap(snap.productionLogCrews) },
                    { model: "productionLogAudit", data: remap(snap.productionLogAudits) },
                    // Stock
                    { model: "stockReservation", data: remap(snap.stockReservations) },
                    { model: "stockLedger", data: remap(snap.stockLedgers) },
                    { model: "stockBalance", data: remap(snap.stockBalances) },
                    // Other
                    { model: "employeeAttendance", data: remap(snap.employeeAttendances) },
                    { model: "activityLog", data: remap(snap.activityLogs) }
                ];

                for (const { model, data } of inserts) {
                    if (!data?.length) continue;
                    // createMany is the fastest way; skip duplicates in case of re-runs
                    await (tx as any)[model].createMany({ data, skipDuplicates: true });
                }
            },
            { timeout: 120_000 } // 2 minutes for large datasets
        );

        return jsonOk({
            restored: true,
            counts: {
                vendors: snap.vendors?.length ?? 0,
                customers: snap.customers?.length ?? 0,
                skus: snap.skus?.length ?? 0,
                salesOrders: snap.salesOrders?.length ?? 0,
                purchaseOrders: snap.purchaseOrders?.length ?? 0,
                productionLogs: snap.productionLogs?.length ?? 0,
                stockLedgers: snap.stockLedgers?.length ?? 0
            }
        });
    } catch (error: any) {
        console.error("Import snapshot error:", error);
        return jsonError(error.message ?? "Failed to import snapshot", 500);
    }
}
