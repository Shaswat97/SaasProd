"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/Card";
import { ToastViewport } from "@/components/ToastViewport";
import { apiSend } from "@/lib/api-client";
import { useToast } from "@/lib/use-toast";

export function SampleDataCard() {
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toasts, push, remove } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const anyBusy = loading || resetting || saving || exporting || importing;

  async function loadSample() {
    setLoading(true);
    try {
      const result = await apiSend<{
        vendors: number;
        customers: number;
        employees: number;
        machines: number;
        rawSkus: number;
        finishedSkus: number;
      }>("/api/settings/sample-data", "POST");
      push(
        "success",
        `Loaded sample data: ${result.vendors} vendors, ${result.customers} customers, ${result.employees} employees.`
      );
    } catch (error: any) {
      push("error", error.message ?? "Failed to load sample data");
    } finally {
      setLoading(false);
    }
  }

  async function resetDemo() {
    if (!window.confirm("Reset all data? This will remove all transactions and master data (including warehouses and zones), keeping only the company record.")) {
      return;
    }
    setResetting(true);
    try {
      await apiSend("/api/settings/reset-data", "POST");
      push("success", "All data reset. Company kept; everything else cleared.");
    } catch (error: any) {
      push("error", error.message ?? "Failed to reset demo data");
    } finally {
      setResetting(false);
    }
  }

  async function saveCurrent() {
    if (!window.confirm("Save the current data as the new sample dataset? This will overwrite prisma/sample-data.json.")) {
      return;
    }
    setSaving(true);
    try {
      const result = await apiSend<{
        vendors: number;
        customers: number;
        employees: number;
        machines: number;
        skus: number;
        boms: number;
        machineSkus: number;
      }>("/api/settings/sample-data/save", "POST");
      push(
        "success",
        `Saved sample data: ${result.vendors} vendors, ${result.customers} customers, ${result.skus} SKUs.`
      );
    } catch (error: any) {
      push("error", error.message ?? "Failed to save sample data");
    } finally {
      setSaving(false);
    }
  }

  async function exportSnapshot() {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export-snapshot");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="(.+)"/);
      a.download = match?.[1] ?? `snapshot-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      push("success", "System snapshot downloaded successfully.");
    } catch (error: any) {
      push("error", error.message ?? "Failed to export snapshot");
    } finally {
      setExporting(false);
    }
  }

  async function importSnapshot(file: File) {
    if (!window.confirm("Import this snapshot? This will RESET all current data and replace it with the snapshot contents.")) {
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/settings/import-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Import failed");
      }
      const result = await res.json();
      const c = result.counts ?? {};
      push(
        "success",
        `Snapshot restored: ${c.vendors ?? 0} vendors, ${c.customers ?? 0} customers, ${c.skus ?? 0} SKUs, ${c.salesOrders ?? 0} sales orders, ${c.purchaseOrders ?? 0} POs, ${c.productionLogs ?? 0} production logs.`
      );
    } catch (error: any) {
      push("error", error.message ?? "Failed to import snapshot");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <ToastViewport toasts={toasts} onDismiss={remove} />
      <Card variant="strong">
        <CardHeader>
          <CardTitle>Demo Data</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3 text-sm text-text-muted">
            <p>Load a small, clean dataset for demos (3 raw SKUs, 2 finished SKUs, 2 vendors, 2 machines, 2 customers, 5 employees). Orders and POs are excluded.</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={loadSample} disabled={anyBusy}>
                {loading ? "Loading..." : "Load Sample Data"}
              </Button>
              <Button variant="secondary" onClick={saveCurrent} disabled={anyBusy}>
                {saving ? "Saving..." : "Save Current as Sample"}
              </Button>
              <Button variant="ghost" onClick={resetDemo} disabled={anyBusy}>
                {resetting ? "Resetting..." : "Reset All Data"}
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="mb-2 font-medium text-gray-700">System Snapshot (Full Backup)</p>
              <p className="mb-3 text-xs text-gray-400">Export all master data, orders, production, inventory, payments & activity as a JSON file. Re-import after a reset to restore the exact same state.</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={exportSnapshot} disabled={anyBusy}>
                  {exporting ? "Exporting..." : "⬇ Export Snapshot"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={anyBusy}
                >
                  {importing ? "Importing..." : "⬆ Import Snapshot"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importSnapshot(file);
                  }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
