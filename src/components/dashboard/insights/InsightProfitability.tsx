"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { DollarSign, PieChart, TrendingUp } from "lucide-react";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

type SKUProfit = {
    skuId: string;
    code: string;
    name: string;
    revenue: number;
    cost: number;
    margin: number;
    marginPct: number;
};

function buildFromData(data: any): SKUProfit[] {
    const topItems = data?.skuProfitability?.top ?? [];
    const bottomItems = data?.skuProfitability?.bottom ?? [];
    const combined = new Map<string, SKUProfit>();
    [...topItems, ...bottomItems].forEach((row: any) => {
        if (!combined.has(row.skuId)) {
            combined.set(row.skuId, {
                skuId: row.skuId,
                code: row.code,
                name: row.name,
                revenue: row.revenue ?? 0,
                cost: row.cost ?? 0,
                margin: row.margin ?? 0,
                marginPct: row.marginPct ?? 0
            });
        }
    });
    return Array.from(combined.values()).sort((a, b) => b.margin - a.margin);
}

export function InsightProfitability({ data }: { data?: any }) {
    const profitData = buildFromData(data);
    const [selectedId, setSelectedId] = useState<string>(profitData[0]?.skuId ?? "");
    const selectedItem = profitData.find(p => p.skuId === selectedId) || profitData[0];

    if (!profitData.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <DollarSign className="w-12 h-12 mb-3 text-green-400" />
                <p className="text-lg font-semibold text-gray-600">No profitability data</p>
                <p className="text-sm">No invoices yet in this period to compute profitability.</p>
            </div>
        );
    }

    const costPct = selectedItem && selectedItem.revenue > 0 ? ((selectedItem.cost / selectedItem.revenue) * 100) : 0;
    const marginPct = selectedItem?.marginPct ?? 0;

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 border-r border-gray-100 pr-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">SKU Performance</h3>
                <div className="space-y-3">
                    {profitData.map((item) => (
                        <button
                            key={item.skuId}
                            onClick={() => setSelectedId(item.skuId)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === item.skuId
                                ? "bg-green-50 border-green-200 shadow-sm"
                                : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm ${selectedId === item.skuId ? "text-green-800" : "text-gray-900"}`}>
                                    {item.code}
                                </span>
                                <span className={`font-mono font-bold ${item.marginPct > 15 ? "text-green-600" : item.marginPct > 0 ? "text-amber-600" : "text-red-500"}`}>
                                    {item.marginPct.toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">{item.name}</div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <DollarSign className="w-3 h-3" /> {currency.format(item.revenue)} Revenue
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pl-2">
                {selectedItem && (
                    <>
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedItem.name}</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span>Code: {selectedItem.code}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Net Margin</div>
                                <div className={`text-3xl font-bold ${selectedItem.margin >= 0 ? "text-green-700" : "text-red-600"}`}>{currency.format(selectedItem.margin)}</div>
                            </div>
                        </div>

                        {/* Cost vs Margin Bar */}
                        <div className="mb-8">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-gray-700" /> Revenue Split
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-6">
                                <div className="flex w-full h-8 rounded-full overflow-hidden mb-4">
                                    {costPct > 0 && (
                                        <div className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white/90" style={{ width: `${Math.min(costPct, 100)}%` }}>
                                            {costPct > 10 && `${costPct.toFixed(0)}%`}
                                        </div>
                                    )}
                                    {marginPct > 0 && (
                                        <div className="bg-green-500 flex items-center justify-center text-xs font-bold text-white/90" style={{ width: `${Math.min(marginPct, 100)}%` }}>
                                            {marginPct > 10 && `${marginPct.toFixed(0)}%`}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm text-gray-600">Cost ({costPct.toFixed(1)}%)</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm text-gray-600">Margin ({marginPct.toFixed(1)}%)</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Financials Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-sm text-blue-600 font-medium mb-1">Revenue</div>
                                <div className="text-xl font-bold text-blue-900">{currency.format(selectedItem.revenue)}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-sm text-gray-600 font-medium mb-1">Cost</div>
                                <div className="text-xl font-bold text-gray-900">{currency.format(selectedItem.cost)}</div>
                            </div>
                            <div className={`p-4 rounded-xl border ${selectedItem.margin >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                                <div className={`text-sm font-medium mb-1 ${selectedItem.margin >= 0 ? "text-green-600" : "text-red-600"}`}>Margin</div>
                                <div className={`text-xl font-bold ${selectedItem.margin >= 0 ? "text-green-900" : "text-red-900"}`}>{currency.format(selectedItem.margin)}</div>
                            </div>
                        </div>

                        {/* Analysis */}
                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-700" /> Automated Analysis
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedItem.marginPct < 10
                                    ? `PROFIT WARNING: This SKU has a margin of only ${selectedItem.marginPct.toFixed(1)}% which is below the sustainability threshold. Consider auditing material costs, renegotiating supplier rates, or re-pricing the product.`
                                    : selectedItem.marginPct < 20
                                        ? `MODERATE MARGIN: At ${selectedItem.marginPct.toFixed(1)}%, this product is profitable but there is room for improvement through cost optimization.`
                                        : `HEALTHY MARGIN: This SKU is a top performer with a ${selectedItem.marginPct.toFixed(1)}% net margin contributing ${currency.format(selectedItem.margin)} in profit.`}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
