"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type PaymentRecord = {
  id: number;
  orderId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  paidAt?: string;
  application: {
    rollNo: string;
    post: {
      code: string;
      name: string;
    };
  };
};

export default function CandidatePayments() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) {
      if (ready && !token) router.replace("/login");
      return;
    }
    loadPayments();
  }, [ready, token, router]);

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await apiFetch<PaymentRecord[]>("/api/payments/my", { token });
      setPayments(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  const totalPaid = payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter((p) => p.status === "SUCCESS").length;
  const failedCount = payments.filter((p) => p.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">View your application fee payments</p>
        </div>
        <Link href="/candidate" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium text-sm">Total Paid</p>
          <p className="text-3xl font-bold text-green-900 mt-1">₹{totalPaid.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium text-sm">Successful</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{successCount}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium text-sm">Failed</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{failedCount}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment Transactions</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No payments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Post</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-gray-900 text-xs">{payment.orderId}</td>
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
                            : payment.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="px-6 py-3">
                      {payment.status === "SUCCESS" && (
                        <Link
                          href={`/candidate/invoice/${payment.id}`}
                          className="text-blue-900 hover:text-blue-950 font-medium text-sm"
                        >
                          Invoice
                        </Link>
                      )}
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
