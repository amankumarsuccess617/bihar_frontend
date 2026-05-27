"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type FinanceSummary = {
  totalPayments: number;
  totalRefunds: number;
  totalInvoices: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  refundAmount: number;
};

export default function AdminFinance() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!ready || !token || !isAdmin) {
      if (ready && (!token || !isAdmin)) router.replace("/");
      return;
    }
    loadSummary();
  }, [ready, token, isAdmin, router]);

  async function loadSummary() {
    setLoading(true);
    try {
      const data = await apiFetch<FinanceSummary>("/api/finance/summary", { token });
      setSummary(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load finance summary");
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = async (type: "payments" | "refunds" | "invoices") => {
    try {
      const filename = `${type}_${new Date().toISOString().split("T")[0]}.csv`;
      const blob = await apiFetch<Blob>(`/api/finance/${type}.csv`, { token });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : `Failed to export ${type}`);
    }
  };

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of financial transactions and revenue</p>
        </div>
        <Link href="/admin" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading finance summary...</p>
        </div>
      ) : summary ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-900 mt-1">₹{(summary.totalRevenue / 100).toLocaleString("en-IN")}</p>
              <p className="text-xs text-green-700 mt-2">{summary.successfulPayments} payments</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 font-medium text-sm">Total Payments</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{summary.totalPayments}</p>
              <p className="text-xs text-blue-700 mt-2">{summary.successfulPayments} success</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 font-medium text-sm">Pending Payments</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{summary.pendingPayments}</p>
              <p className="text-xs text-yellow-700 mt-2">{summary.failedPayments} failed</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium text-sm">Refunds Issued</p>
              <p className="text-3xl font-bold text-red-900 mt-1">₹{(summary.refundAmount / 100).toLocaleString("en-IN")}</p>
              <p className="text-xs text-red-700 mt-2">{summary.totalRefunds} refunds</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Export Reports</h2>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleExportCSV("payments")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm"
              >
                Export Payments
              </button>
              <button
                onClick={() => handleExportCSV("refunds")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm"
              >
                Export Refunds
              </button>
              <button
                onClick={() => handleExportCSV("invoices")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm"
              >
                Export Invoices
              </button>
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Invoices */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900">Invoices Generated</h3>
              <p className="text-4xl font-bold text-gray-900 mt-4">{summary.totalInvoices}</p>
              <p className="text-gray-600 mt-2">Total invoice documents created</p>
            </div>

            {/* Payment Success Rate */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900">Payment Success Rate</h3>
              <div className="mt-4">
                {summary.totalPayments > 0 ? (
                  <>
                    <p className="text-4xl font-bold text-green-900">
                      {Math.round((summary.successfulPayments / summary.totalPayments) * 100)}%
                    </p>
                    <p className="text-gray-600 mt-2">
                      {summary.successfulPayments} of {summary.totalPayments} payments successful
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">No payment data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> All financial metrics are calculated from successful transactions. Contact support for
              detailed transaction history or reconciliation reports.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Unable to load finance summary</p>
        </div>
      )}
    </div>
  );
}
