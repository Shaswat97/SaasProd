"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

type LossItem = {
    id: string;
    code: string;
    name: string;
    lossCost: number;
    lossQty: number;
    rejectQty: number;
    scrapQty: number;
    logs: number;
};

function buildFromData(data: any): LossItem[] {
    if (!data?.lossLeakage?.topLossSkus?.length) return [];
    return data.lossLeakage.topLossSkus.map((row: any) => ({
        id: row.skuId,
        code: row.code,
        name: row.name,
        lossCost: row.lossCost,
        lossQty: row.lossQty,
        rejectQty: row.rejectQty,
        scrapQty: row.scrapQty,
        logs: row.logs
    }));
}

export function InsightLossAnalysis({ data }: { data?: any }) {
    const lossData = buildFromData(data);
    const [selectedId, setSelectedId] = useState<string>(lossData[0]?.id ?? "");
    const selectedItem = lossData.find(item => item.id === selectedId) || lossData[0];

    const totalRejectCost = data?.lossLeakage?.rejectCost ?? 0;
    const totalScrapCost = data?.lossLeakage?.scrapCost ?? 0;
    const totalMaterialVariance = data?.lossLeakage?.materialVarianceCost ?? 0;
    const totalLoss = totalRejectCost + totalScrapCost + totalMaterialVariance;

    if (!lossData.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <TrendingDown className="w-12 h-12 mb-3 text-green-400" />
                <p className="text-lg font-semibold text-gray-600">No loss data in this period</p>
                <p className="text-sm">Great job — zero production waste detected!</p>
            </div>
        );
    }

    const rejectPct = selectedItem ? (selectedItem.lossQty > 0 ? (selectedItem.rejectQty / selectedItem.lossQty) * 100 : 0) : 0;
    const scrapPct = selectedItem ? (selectedItem.lossQty > 0 ? (selectedItem.scrapQty / selectedItem.lossQty) * 100 : 0) : 0;

    return (
        <div className="flex h-full gap-6">
            {/* Master List */}
            <div className="w-1/3 border-r border-gray-100 pr-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Top Loss Drivers</h3>
                {/* Summary */}
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-red-700">Reject Cost</span><span className="font-bold text-red-800">{currency.format(totalRejectCost)}</span></div>
                    <div className="flex justify-between"><span className="text-red-700">Scrap Cost</span><span className="font-bold text-red-800">{currency.format(totalScrapCost)}</span></div>
                    <div className="flex justify-between"><span className="text-red-700">Material Variance</span><span className="font-bold text-red-800">{currency.format(totalMaterialVariance)}</span></div>
                    <div className="border-t border-red-200 pt-1 flex justify-between font-bold"><span className="text-red-900">Total Loss</span><span className="text-red-900">{currency.format(totalLoss)}</span></div>
                </div>
                <div className="space-y-3">
                    {lossData.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedId(item.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === item.id
                                ? "bg-purple-50 border-purple-200 shadow-sm"
                                : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm ${selectedId === item.id ? "text-purple-700" : "text-gray-900"}`}>
                                    {item.code}
                                </span>
                                <span className="text-red-600 font-mono font-bold">{currency.format(item.lossCost)}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate mb-2">{item.name}</div>
                            <Badge variant="danger" label={`${item.lossQty} units lost`} className="text-[10px] px-1.5 py-0.5" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 overflow-y-auto pl-2">
                {selectedItem && (
                    <>
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedItem.name} ({selectedItem.code})</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-amber-500" /> {selectedItem.logs} production run{selectedItem.logs !== 1 ? "s" : ""}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total Loss Impact</div>
                                <div className="text-3xl font-bold text-red-600">{currency.format(selectedItem.lossCost)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Reject vs Scrap Breakdown */}
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-gray-700" /> Loss Breakdown
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">Reject</span>
                                            <span className="font-bold text-gray-900">{selectedItem.rejectQty} units ({rejectPct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${rejectPct}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">Scrap</span>
                                            <span className="font-bold text-gray-900">{selectedItem.scrapQty} units ({scrapPct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500" style={{ width: `${scrapPct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Machine-level losses */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4">Top Loss Machines</h4>
                                <div className="space-y-3">
                                    {(data?.lossLeakage?.topLossMachines ?? []).slice(0, 5).map((machine: any) => (
                                        <div key={machine.machineId} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{machine.code} · {machine.name}</span>
                                            <span className="font-mono font-bold text-red-600">{currency.format(machine.lossCost)}</span>
                                        </div>
                                    ))}
                                    {(!data?.lossLeakage?.topLossMachines?.length) && (
                                        <div className="text-sm text-gray-400 italic">No machine-level data.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="mt-8 bg-purple-50 border border-purple-100 rounded-2xl p-6">
                            <h4 className="font-bold text-purple-900 mb-2">Recommended Actions</h4>
                            <ul className="text-sm text-purple-800 space-y-2">
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-purple-500" />
                                    Investigate reject root causes for {selectedItem.code} — {selectedItem.rejectQty} units rejected across {selectedItem.logs} production runs.
                                </li>
                                {totalMaterialVariance > 0 && (
                                    <li className="flex items-start gap-2">
                                        <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-purple-500" />
                                        Material variance loss of {currency.format(totalMaterialVariance)} detected. Review BOM accuracy and raw material quality.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
