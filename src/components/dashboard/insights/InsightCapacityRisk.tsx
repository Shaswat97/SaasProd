"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { Activity, Zap } from "lucide-react";

type MachineRisk = {
    machineId: string;
    code: string;
    name: string;
    requiredMinutes: number;
    availableMinutes: number;
    loadPct: number;
    risk: string;
};

function buildFromData(data: any): MachineRisk[] {
    if (!data?.capacityRisk?.items?.length) return [];
    return data.capacityRisk.items.map((row: any) => ({
        machineId: row.machineId,
        code: row.code,
        name: row.name,
        requiredMinutes: row.requiredMinutes,
        availableMinutes: row.availableMinutes,
        loadPct: row.loadPct,
        risk: row.risk
    }));
}

function formatHrs(minutes: number) {
    return `${(minutes / 60).toFixed(1)}h`;
}

export function InsightCapacityRisk({ data }: { data?: any }) {
    const machineData = buildFromData(data);
    const [selectedId, setSelectedId] = useState<string>(machineData[0]?.machineId ?? "");
    const selectedMachine = machineData.find(m => m.machineId === selectedId) || machineData[0];

    if (!machineData.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <Activity className="w-12 h-12 mb-3 text-green-400" />
                <p className="text-lg font-semibold text-gray-600">No capacity risk detected</p>
                <p className="text-sm">All machines have sufficient capacity for the upcoming orders.</p>
            </div>
        );
    }

    const riskVariant = (risk: string) => risk === "CRITICAL" || risk === "HIGH" ? "danger" : risk === "WATCH" ? "warning" : "neutral";
    const windowDays = data?.capacityRisk?.windowDays ?? 7;

    return (
        <div className="flex h-full gap-6">
            {/* Master List */}
            <div className="w-1/3 border-r border-gray-100 pr-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Machine Load ({windowDays}d Forecast)</h3>
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
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold text-sm ${selectedId === item.machineId ? "text-blue-700" : "text-gray-900"}`}>
                                    {item.code} · {item.name}
                                </span>
                                <Badge variant={riskVariant(item.risk)} label={item.risk} className="text-[10px]" />
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                <span>Load: <span className="font-mono font-bold text-gray-900">{item.loadPct.toFixed(1)}%</span></span>
                                <span>Req: {formatHrs(item.requiredMinutes)}</span>
                            </div>
                            <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div
                                    className={`h-full ${item.loadPct > 100 ? "bg-red-500" : item.loadPct > 80 ? "bg-orange-400" : "bg-green-500"}`}
                                    style={{ width: `${Math.min(item.loadPct, 100)}%` }}
                                />
                            </div>
                        </button>
                    ))}
                </div>
                {data?.capacityRisk?.missingRouting?.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                        <span className="font-bold">Missing Routing:</span> {data.capacityRisk.missingRouting.length} SKU(s) need routing setup for capacity forecasting.
                    </div>
                )}
            </div>

            {/* Detail View */}
            <div className="flex-1 overflow-y-auto pl-2">
                {selectedMachine && (
                    <>
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedMachine.code} · {selectedMachine.name}</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500" /> {selectedMachine.risk} Risk</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Capacity Utilization</div>
                                <div className={`text-3xl font-bold ${selectedMachine.loadPct > 100 ? "text-red-600" : selectedMachine.loadPct > 80 ? "text-orange-600" : "text-gray-900"}`}>{selectedMachine.loadPct.toFixed(1)}%</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-sm text-blue-600 font-medium mb-1">Required Time</div>
                                <div className="text-2xl font-bold text-blue-900">{formatHrs(selectedMachine.requiredMinutes)}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-sm text-gray-600 font-medium mb-1">Available ({windowDays}d)</div>
                                <div className="text-2xl font-bold text-gray-900">{formatHrs(selectedMachine.availableMinutes)}</div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Activity className="w-5 h-5" /> Capacity Optimization
                            </h4>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                {selectedMachine.loadPct > 100
                                    ? `This machine is OVERLOADED at ${selectedMachine.loadPct.toFixed(0)}%. It needs ${formatHrs(selectedMachine.requiredMinutes)} but only ${formatHrs(selectedMachine.availableMinutes)} is available. Consider offloading work to an alternative machine or scheduling overtime.`
                                    : selectedMachine.loadPct > 80
                                        ? `This machine is running at high capacity (${selectedMachine.loadPct.toFixed(0)}%). Monitor closely and consider preemptive maintenance to avoid bottlenecks.`
                                        : "Machine is operating within safe parameters. No immediate action required."}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
