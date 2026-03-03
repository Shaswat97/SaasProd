"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { Package, AlertTriangle, Clock, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/DataTable";

const number = new Intl.NumberFormat("en-IN");

type InventoryCategory = {
    id: string;
    title: string;
    description: string;
    severity: "critical" | "warning" | "neutral";
    count: number;
    icon: any;
};

function buildCategories(data: any): InventoryCategory[] {
    const inv = data?.inventoryHealth;
    const stockoutCount = inv?.stockoutRisk?.length ?? 0;
    const deadCount = inv?.deadStock?.length ?? 0;
    const slowCount = inv?.slowMoving?.length ?? 0;
    const batchCount = inv?.rawBatchAging?.length ?? 0;

    return [
        {
            id: "stockout_risk",
            title: "Stockout Risk",
            description: "Raw materials with less than 14 days of cover.",
            severity: stockoutCount > 0 ? "critical" : "neutral",
            count: stockoutCount,
            icon: AlertTriangle
        },
        {
            id: "dead_stock",
            title: "Dead Stock",
            description: "No movement for 90+ days.",
            severity: deadCount > 0 ? "warning" : "neutral",
            count: deadCount,
            icon: Package
        },
        {
            id: "slow_moving",
            title: "Slow Moving",
            description: "Movement older than 30 days (but under 90).",
            severity: slowCount > 0 ? "warning" : "neutral",
            count: slowCount,
            icon: Clock
        },
        {
            id: "batch_aging",
            title: "Raw Batch Aging",
            description: "Open raw batches older than 30 days.",
            severity: batchCount > 0 ? "warning" : "neutral",
            count: batchCount,
            icon: Clock
        }
    ];
}

export function InsightInventoryHealth({ data }: { data?: any }) {
    const categories = buildCategories(data);
    const [selectedId, setSelectedId] = useState<string>("stockout_risk");
    const selectedCategory = categories.find(c => c.id === selectedId) || categories[0];

    const inv = data?.inventoryHealth;

    const stockoutRows = (inv?.stockoutRisk ?? []).map((row: any) => ({
        sku: `${row.code} · ${row.name}`,
        onHand: `${number.format(row.onHand)} ${row.unit}`,
        dailyUse: `${number.format(Math.round(row.avgDailyUsage))} ${row.unit}`,
        cover: row.daysCover != null ? `${Math.round(row.daysCover)} Days` : "—"
    }));

    const deadStockRows = (inv?.deadStock ?? []).map((row: any) => ({
        sku: `${row.code} · ${row.name}`,
        qty: `${number.format(row.qty)} ${row.unit}`,
        age: `${row.ageDays} Days`
    }));

    const slowMovingRows = (inv?.slowMoving ?? []).map((row: any) => ({
        sku: `${row.code} · ${row.name}`,
        qty: `${number.format(row.qty)} ${row.unit}`,
        age: `${row.ageDays} Days`
    }));

    const batchAgingRows = (inv?.rawBatchAging ?? []).map((row: any) => ({
        batch: row.batchNumber,
        sku: `${row.skuCode} · ${row.skuName}`,
        remaining: `${number.format(row.quantityRemaining)} ${row.unit}`,
        age: `${row.ageDays} Days`
    }));

    const renderDetailContent = () => {
        switch (selectedId) {
            case "stockout_risk":
                return (
                    <div className="space-y-4">
                        {stockoutRows.length > 0 && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 mb-6">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-sm font-medium">Immediate Action Required: Production may be at risk for {stockoutRows.length} item{stockoutRows.length !== 1 ? "s" : ""}.</span>
                            </div>
                        )}
                        <DataTable
                            columns={[
                                { key: "sku", label: "RAW SKU" },
                                { key: "onHand", label: "ON HAND", align: "right" },
                                { key: "dailyUse", label: "AVG DAILY USE", align: "right" },
                                { key: "cover", label: "DAYS COVER", align: "right" },
                            ]}
                            rows={stockoutRows}
                            className="bg-white"
                            emptyLabel="No stockout risks detected. Great inventory management!"
                        />
                    </div>
                );
            case "dead_stock":
                return (
                    <div className="space-y-4">
                        <DataTable
                            columns={[
                                { key: "sku", label: "SKU" },
                                { key: "qty", label: "QTY ON HAND", align: "right" },
                                { key: "age", label: "DAYS SINCE LAST MOVE", align: "right" },
                            ]}
                            rows={deadStockRows}
                            className="bg-white"
                            emptyLabel="No dead stock detected. Great job!"
                        />
                    </div>
                );
            case "slow_moving":
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 mb-4">Items with low turnover rate over the last 30–90 days.</p>
                        <DataTable
                            columns={[
                                { key: "sku", label: "SKU" },
                                { key: "qty", label: "QTY ON HAND", align: "right" },
                                { key: "age", label: "DAYS SINCE LAST MOVE", align: "right" },
                            ]}
                            rows={slowMovingRows}
                            className="bg-white"
                            emptyLabel="No slow moving items."
                        />
                    </div>
                );
            case "batch_aging":
                return (
                    <div className="space-y-4">
                        <DataTable
                            columns={[
                                { key: "batch", label: "BATCH" },
                                { key: "sku", label: "SKU" },
                                { key: "remaining", label: "REMAINING", align: "right" },
                                { key: "age", label: "AGE (DAYS)", align: "right" },
                            ]}
                            rows={batchAgingRows}
                            className="bg-white"
                            emptyLabel="No aged raw batches."
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 border-r border-gray-100 pr-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Health Categories</h3>
                <div className="space-y-3">
                    {categories.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedId(item.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === item.id
                                ? "bg-gray-50 border-gray-300 shadow-sm"
                                : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm ${selectedId === item.id ? "text-gray-900" : "text-gray-600"}`}>
                                    {item.title}
                                </span>
                                <Badge
                                    variant={item.severity === "critical" ? "danger" : item.severity === "warning" ? "warning" : "neutral"}
                                    label={item.count > 0 ? `${item.count} Item${item.count !== 1 ? "s" : ""}` : "Clean"}
                                    className="text-[10px]"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pl-2">
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedCategory.title}</h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <selectedCategory.icon className="w-4 h-4 text-gray-400" />
                                {selectedCategory.description}
                            </span>
                        </div>
                    </div>
                </div>

                {renderDetailContent()}

            </div>
        </div>
    );
}
