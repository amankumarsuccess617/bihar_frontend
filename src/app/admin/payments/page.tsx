"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Payment = {
  id: number;
  applicationId: number;
  orderId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  paidAt?: string;
  application: {
    id: number;
    rollNo: string;
    post: {
      code: string;
      name: string;
    };
  };
};

export default function AdminPayments() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "SUCCESS" | "FAILED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!ready || !token || !isAdmin) {
      if (ready && (!token || !isAdmin)) router.replace("/");
      return;
    }
    loadPayments();
  }, [ready, token, isAdmin, router, statusFilter]);

  async function loadPayments() {
    setLoading(true);
    try {
      const q = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
      const data = await apiFetch<Payment[]>(`/api/payments${q}`, { token });
      setPayments(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  const filtered = payments.filter(
    (p) =>
      p.application.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.application.post.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const successPayments = payments.filter((p) => p.status === "SUCCESS");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const failedPayments = payments.filter((p) => p.status === "FAILED");
  const totalAmount = successPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const csv = [
      ["Order ID", "Roll No", "Post Code", "Amount", "Status", "Date"],
      ...filtered.map((p) => [
        p.orderId,
        p.application.rollNo,
        p.application.post.code,
        `₹${p.amount}`,
        p.status,
        p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage application fee payments</p>
        </div>
        <Link href="/admin" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{payments.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium text-sm">Success</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{successPayments.length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 font-medium text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 mt-1">{pendingPayments.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium text-sm">Total Amount</p>
          <p className="text-3xl font-bold text-red-900 mt-1">₹{totalAmount.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by Roll No, Post Code, or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "SUCCESS", "FAILED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  statusFilter === status
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
        >
          Export CSV
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment Records ({filtered.length})</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Roll No</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Post</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-gray-900 text-xs">{payment.orderId}</td>
                    <td className="px-6 py-3 font-mono text-gray-900">{payment.application.rollNo}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900 text-sm">{payment.application.post.code}</div>
                      <div className="text-xs text-gray-600">{payment.application.post.name}</div>
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900">₹{payment.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                          payment.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
