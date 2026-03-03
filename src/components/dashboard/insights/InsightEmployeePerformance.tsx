"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { User, TrendingUp, Clock, CheckCircle, AlertCircle, Users } from "lucide-react";

type EmployeeRow = {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    totalGood: number;
    totalReject: number;
    totalScrap: number;
    totalOutput: number;
    performancePct: number;
    runs: number;
    varianceFromTeamPct: number;
};

function buildFromData(data: any): EmployeeRow[] {
    if (!data?.employeeEfficiency) return [];
    const topItems = data.employeeEfficiency.top ?? [];
    const bottomItems = data.employeeEfficiency.bottom ?? [];
    const combined = new Map<string, EmployeeRow>();
    [...topItems, ...bottomItems].forEach((row: any) => {
        if (!combined.has(row.employeeId)) {
            combined.set(row.employeeId, {
                employeeId: row.employeeId,
                employeeName: row.employeeName,
                employeeCode: row.employeeCode,
                totalGood: row.totalGood ?? 0,
                totalReject: row.totalReject ?? 0,
                totalScrap: row.totalScrap ?? 0,
                totalOutput: row.totalOutput ?? 0,
                performancePct: row.performancePct ?? 0,
                runs: row.runs ?? 0,
                varianceFromTeamPct: row.varianceFromTeamPct ?? 0
            });
        }
    });
    return Array.from(combined.values()).sort((a, b) => b.performancePct - a.performancePct);
}

export function InsightEmployeePerformance({ data }: { data?: any }) {
    const employeeData = buildFromData(data);
    const [selectedId, setSelectedId] = useState<string>(employeeData[0]?.employeeId ?? "");
    const selectedEmp = employeeData.find(e => e.employeeId === selectedId) || employeeData[0];
    const teamAvg = data?.employeeEfficiency?.teamAveragePerformancePct ?? 0;

    if (!employeeData.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <Users className="w-12 h-12 mb-3 text-blue-400" />
                <p className="text-lg font-semibold text-gray-600">No production data for employees</p>
                <p className="text-sm">Run some production batches to see workforce insights.</p>
            </div>
        );
    }

    const qualityPct = selectedEmp && selectedEmp.totalOutput > 0 ? (selectedEmp.totalGood / selectedEmp.totalOutput) * 100 : 0;
    const rejectPct = selectedEmp && selectedEmp.totalOutput > 0 ? (selectedEmp.totalReject / selectedEmp.totalOutput) * 100 : 0;

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 border-r border-gray-100 pr-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Workforce Performance</h3>
                <p className="text-xs text-gray-400 mb-4">Team avg: {teamAvg.toFixed(1)}% yield</p>
                <div className="space-y-3">
                    {employeeData.map((item) => (
                        <button
                            key={item.employeeId}
                            onClick={() => setSelectedId(item.employeeId)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === item.employeeId
                                ? "bg-purple-50 border-purple-200 shadow-sm"
                                : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm ${selectedId === item.employeeId ? "text-purple-700" : "text-gray-900"}`}>
                                    {item.employeeName}
                                </span>
                                <Badge
                                    variant={item.performancePct >= 90 ? "success" : item.performancePct >= 70 ? "warning" : "danger"}
                                    label={`${item.performancePct.toFixed(0)}%`}
                                    className="font-mono"
                                />
                            </div>
                            <div className="text-xs text-gray-500 mb-2">{item.employeeCode} · {item.runs} run{item.runs !== 1 ? "s" : ""}</div>
                            <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div
                                    className={`h-full ${item.performancePct >= 90 ? "bg-green-500" : item.performancePct >= 70 ? "bg-yellow-400" : "bg-red-500"}`}
                                    style={{ width: `${Math.min(item.performancePct, 100)}%` }}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pl-2">
                {selectedEmp && (
                    <>
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedEmp.employeeName}</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><User className="w-4 h-4 text-purple-500" /> {selectedEmp.employeeCode}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /> {selectedEmp.runs} production runs</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Yield Rate</div>
                                <div className="text-3xl font-bold text-gray-900">{selectedEmp.performancePct.toFixed(1)}%</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="text-sm text-green-600 font-medium mb-1">Good Qty</div>
                                <div className="text-2xl font-bold text-green-900">{selectedEmp.totalGood.toLocaleString("en-IN")}</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <div className="text-sm text-red-600 font-medium mb-1">Reject + Scrap</div>
                                <div className="text-2xl font-bold text-red-900">{(selectedEmp.totalReject + selectedEmp.totalScrap).toLocaleString("en-IN")}</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-sm text-blue-600 font-medium mb-1">vs. Team Avg</div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className={`w-5 h-5 ${selectedEmp.varianceFromTeamPct >= 0 ? "text-green-600" : "text-red-500"}`} />
                                    <span className={`text-lg font-bold ${selectedEmp.varianceFromTeamPct >= 0 ? "text-green-700" : "text-red-600"}`}>
                                        {selectedEmp.varianceFromTeamPct >= 0 ? "+" : ""}{selectedEmp.varianceFromTeamPct.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Output Quality Bars */}
                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6">
                            <h4 className="font-bold text-gray-900 mb-4">Output Quality</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">Good Yield</span>
                                        <span className="font-bold text-green-700">{qualityPct.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${qualityPct}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">Reject Rate</span>
                                        <span className="font-bold text-red-600">{rejectPct.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${rejectPct}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="font-bold text-gray-900 mb-2">Automated Feedback</h4>
                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                {selectedEmp.performancePct >= 90
                                    ? `"${selectedEmp.employeeName} is a top performer with ${selectedEmp.performancePct.toFixed(1)}% yield across ${selectedEmp.runs} production runs — exceeding the team average by ${selectedEmp.varianceFromTeamPct.toFixed(1)}%."`
                                    : selectedEmp.performancePct >= 70
                                        ? `"${selectedEmp.employeeName} shows consistent performance at ${selectedEmp.performancePct.toFixed(1)}% yield. To improve further, focus on reducing reject output (currently ${rejectPct.toFixed(1)}%)."`
                                        : `"${selectedEmp.employeeName} is underperforming at ${selectedEmp.performancePct.toFixed(1)}% yield — ${Math.abs(selectedEmp.varianceFromTeamPct).toFixed(1)}% below team average. Additional training or process review is recommended."`}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
