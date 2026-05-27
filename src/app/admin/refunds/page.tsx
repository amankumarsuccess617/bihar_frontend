"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Refund = {
  id: number;
  applicationId: number;
  paymentId: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  reason: string;
  requestedAt: string;
  processedAt?: string;
  application: {
    id: number;
    rollNo: string;
    post: {
      code: string;
      name: string;
    };
  };
};

export default function AdminRefunds() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [filters, setFilters] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!ready || !token || !isAdmin) {
      if (ready && (!token || !isAdmin)) router.replace("/");
      return;
    }
    loadRefunds();
  }, [ready, token, isAdmin, router, filters]);

  async function loadRefunds() {
    setLoading(true);
    try {
      const q = filters === "ALL" ? "" : `?status=${filters}`;
      const data = await apiFetch<Refund[]>(`/api/refunds${q}`, { token });
      setRefunds(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load refunds");
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: number) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await apiFetch(`/api/refunds/${id}/approve`, {
        method: "POST",
        token,
        body: JSON.stringify({}),
      });
      setMsg("Refund approved successfully");
      loadRefunds();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to approve refund");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (id: number) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await apiFetch(`/api/refunds/${id}/reject`, {
        method: "POST",
        token,
        body: JSON.stringify({}),
      });
      setMsg("Refund rejected");
      loadRefunds();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to reject refund");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  const pendingCount = refunds.filter((r) => r.status === "PENDING").length;
  const approvedCount = refunds.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = refunds.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Refunds</h1>
          <p className="text-gray-600 mt-1">Process and manage refund requests from candidates</p>
        </div>
        <Link href="/admin" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="success">{msg}</Alert>}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 font-medium text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilters(status as any)}
              className={`px-4 py-2 rounded font-medium transition ${
                filters === status
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Refund Requests</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading refunds...</div>
        ) : refunds.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No refunds to display</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Roll No</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Post</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Reason</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Requested</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-gray-900">{refund.application.rollNo}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{refund.application.post.code}</div>
                      <div className="text-xs text-gray-600">{refund.application.post.name}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{refund.reason}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      {new Date(refund.requestedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          refund.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : refund.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {refund.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(refund.id)}
                            disabled={busy}
                            className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(refund.id)}
                            disabled={busy}
                            className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
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
