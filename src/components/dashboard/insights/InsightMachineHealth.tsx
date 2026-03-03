"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { Activity, Power, AlertTriangle } from "lucide-react";

type MachineRow = {
    machineId: string;
    code: string;
    name: string;
    utilizationPct: number;
    avgOee: number;
    yieldPct: number;
    goodQty: number;
    rejectQty: number;
    scrapQty: number;
    runtimeMinutes: number;
    downtimeMinutes: number;
    lossQty: number;
    throughputPerHour: number;
};

function buildFromData(data: any): MachineRow[] {
    if (!data?.machineEffectiveness?.length) return [];
    return data.machineEffectiveness.map((row: any) => ({
        machineId: row.machineId,
        code: row.code,
        name: row.name,
        utilizationPct: row.utilizationPct ?? 0,
        avgOee: row.avgOee ?? 0,
        yieldPct: row.yieldPct ?? 0,
        goodQty: row.goodQty ?? 0,
        rejectQty: row.rejectQty ?? 0,
        scrapQty: row.scrapQty ?? 0,
        runtimeMinutes: row.runtimeMinutes ?? 0,
        downtimeMinutes: row.downtimeMinutes ?? 0,
        lossQty: row.lossQty ?? 0,
        throughputPerHour: row.throughputPerHour ?? 0
    }));
}

function formatHrs(minutes: number) {
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    return `${(minutes / 60).toFixed(1)}h`;
}

export function InsightMachineHealth({ data }: { data?: any }) {
    const machineData = buildFromData(data);
    const [selectedId, setSelectedId] = useState<string>(machineData[0]?.machineId ?? "");
    const selectedMachine = machineData.find(m => m.machineId === selectedId) || machineData[0];

    if (!machineData.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <Activity className="w-12 h-12 mb-3 text-blue-400" />
                <p className="text-lg font-semibold text-gray-600">No machine data available</p>
                <p className="text-sm">Start some production runs to see machine health metrics.</p>
            </div>
        );
    }

    const status = (m: MachineRow) => m.runtimeMinutes > 0 ? (m.avgOee >= 60 ? "Running" : "Degraded") : "Idle";
    const statusVariant = (s: string) => s === "Running" ? "success" : s === "Idle" ? "warning" : "danger";

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 border-r border-gray-100 pr-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Machine Status</h3>
                <div className="space-y-3">
                    {machineData.map((item) => (
                        <button
                            key={item.machineId}
                            onClick={() => setSelectedId(item.machineId)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === item.machineId
                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm ${selectedId === item.machineId ? "text-blue-700" : "text-gray-900"}`}>
                                    {item.code} · {item.name}
                                </span>
                                <Badge
                                    variant={statusVariant(status(item))}
                                    label={status(item)}
                                    className="px-1.5 py-0.5 text-[10px]"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">OEE Score:</span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.avgOee >= 85 ? "bg-green-500" : item.avgOee >= 60 ? "bg-yellow-400" : "bg-red-500"}`}
                                        style={{ width: `${Math.min(item.avgOee, 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{item.avgOee.toFixed(0)}%</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pl-2">
                {selectedMachine && (
                    <>
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedMachine.code} · {selectedMachine.name}</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Power className={`w-4 h-4 ${status(selectedMachine) === "Running" ? "text-green-500" : "text-amber-500"}`} />
                                        Status: <span className="font-semibold">{status(selectedMachine)}</span>
                                    </span>
                                    <span className="text-gray-400">|</span>
                                    <span>Runtime: {formatHrs(selectedMachine.runtimeMinutes)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Overall OEE</div>
                                <div className="text-3xl font-bold text-blue-900">{selectedMachine.avgOee.toFixed(0)}%</div>
                            </div>
                        </div>

                        {selectedMachine.downtimeMinutes > selectedMachine.runtimeMinutes && (
                            <div className="mb-6 p-4 rounded-xl border flex items-center gap-3 bg-amber-50 border-amber-100 text-amber-700">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div>
                                    <span className="font-bold">High Downtime:</span> {formatHrs(selectedMachine.downtimeMinutes)} idle vs {formatHrs(selectedMachine.runtimeMinutes)} runtime
                                </div>
                            </div>
                        )}

                        {/* OEE Breakdown Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col items-center text-center">
                                <div className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Utilization</div>
                                <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="40" cy="40" r="36" className="text-gray-100" strokeWidth="8" fill="none" stroke="currentColor" />
                                        <circle cx="40" cy="40" r="36" className="text-blue-500" strokeWidth="8" fill="none" stroke="currentColor" strokeDasharray={`${Math.min(selectedMachine.utilizationPct, 100) * 2.26} 226`} />
                                    </svg>
                                    <span className="absolute text-lg font-bold text-gray-800">{selectedMachine.utilizationPct.toFixed(0)}%</span>
                                </div>
                                <div className="text-xs text-gray-400">Run Time / Available</div>
                            </div>

                            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col items-center text-center">
                                <div className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Throughput</div>
                                <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="40" cy="40" r="36" className="text-gray-100" strokeWidth="8" fill="none" stroke="currentColor" />
                                        <circle cx="40" cy="40" r="36" className="text-purple-500" strokeWidth="8" fill="none" stroke="currentColor" strokeDasharray={`${Math.min(selectedMachine.throughputPerHour * 2, 226)} 226`} />
                                    </svg>
                                    <span className="absolute text-lg font-bold text-gray-800">{selectedMachine.throughputPerHour.toFixed(1)}</span>
                                </div>
                                <div className="text-xs text-gray-400">Units / Hour</div>
                            </div>

                            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col items-center text-center">
                                <div className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Quality Yield</div>
                                <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="40" cy="40" r="36" className="text-gray-100" strokeWidth="8" fill="none" stroke="currentColor" />
                                        <circle cx="40" cy="40" r="36" className="text-green-500" strokeWidth="8" fill="none" stroke="currentColor" strokeDasharray={`${selectedMachine.yieldPct * 2.26} 226`} />
                                    </svg>
                                    <span className="absolute text-lg font-bold text-gray-800">{selectedMachine.yieldPct.toFixed(0)}%</span>
                                </div>
                                <div className="text-xs text-gray-400">Good / Total Output</div>
                            </div>
                        </div>

                        {/* Output Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                                <div className="text-xs text-green-600 font-medium">Good</div>
                                <div className="text-lg font-bold text-green-900">{selectedMachine.goodQty.toLocaleString("en-IN")}</div>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
                                <div className="text-xs text-red-600 font-medium">Reject</div>
                                <div className="text-lg font-bold text-red-900">{selectedMachine.rejectQty.toLocaleString("en-IN")}</div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                                <div className="text-xs text-orange-600 font-medium">Scrap</div>
                                <div className="text-lg font-bold text-orange-900">{selectedMachine.scrapQty.toLocaleString("en-IN")}</div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Activity className="w-5 h-5" /> AI Diagnostic
                            </h4>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                {selectedMachine.avgOee < 60
                                    ? `CRITICAL: This machine has an OEE of ${selectedMachine.avgOee.toFixed(0)}% which indicates significant operational inefficiency. Total loss: ${selectedMachine.lossQty} units. Investigate downtime causes and schedule maintenance.`
                                    : selectedMachine.avgOee < 85
                                        ? `WARNING: OEE at ${selectedMachine.avgOee.toFixed(0)}% — performance is below optimal. ${selectedMachine.lossQty > 0 ? `${selectedMachine.lossQty} units were lost to rejects/scrap.` : ""} Check for speed losses during shifts.`
                                        : `OPTIMAL: Running at ${selectedMachine.avgOee.toFixed(0)}% OEE with ${selectedMachine.yieldPct.toFixed(0)}% quality yield. No action required.`}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
