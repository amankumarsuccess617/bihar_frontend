"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Alert } from "@/components/Alert";
import { useAuth } from "@/providers/AuthProvider";

type ApplicationRow = {
  id: number;
  applicationNo: string;
  status: string;
  post: {
    id: number;
    code: string;
    name: string;
    recruitment: { code: string; title: string };
  };
  admitCard?: { rollNo: string } | null;
  result?: { rank: number | null; totalMarks: number | null } | null;
};

export default function CandidateHome() {
  const { token, ready } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ApplicationRow[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await apiFetch<ApplicationRow[]>("/api/applications/me", {
          token,
        });
        if (!cancelled) setItems(rows);
      } catch (e) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "Failed to load applications");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, token, router]);

  if (!ready || !token) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your applications and track your progress</p>
        </div>
        <Link
          href="/recruitments"
          className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded font-medium"
        >
          Browse Recruitments
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link
          href="/candidate/applications"
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <h3 className="font-bold text-gray-900">My Applications</h3>
          <p className="text-sm text-gray-600 mt-1">View all your applications</p>
        </Link>
        <Link
          href="/candidate/payments"
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <h3 className="font-bold text-gray-900">Payment History</h3>
          <p className="text-sm text-gray-600 mt-1">Track your payments</p>
        </Link>
        <Link
          href="/candidate/admit-cards"
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <h3 className="font-bold text-gray-900">Admit Cards</h3>
          <p className="text-sm text-gray-600 mt-1">Download admit cards</p>
        </Link>
        <Link
          href="/candidate/results"
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <h3 className="font-bold text-gray-900">My Results</h3>
          <p className="text-sm text-gray-600 mt-1">View your results</p>
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Application No</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Post</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Roll No</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(items ?? []).slice(0, 5).map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-xs text-gray-900">{a.applicationNo}</td>
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900">{a.post.name}</div>
                    <div className="text-xs text-gray-600">{a.post.code}</div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-gray-700">{a.admitCard?.rollNo ?? "—"}</td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/candidate/application/${a.id}`}
                      className="text-blue-900 hover:text-blue-950 font-medium text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!err && items && items.length === 0 && (
          <div className="p-6 text-center text-gray-600">
            No applications yet.{" "}
            <Link href="/recruitments" className="text-blue-900 hover:text-blue-950 font-medium">
              Start applying →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
