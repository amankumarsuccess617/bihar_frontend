"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Alert } from "@/components/Alert";
import { useAuth } from "@/providers/AuthProvider";

type MyResultRow = {
  applicationId: number;
  applicationNo: string;
  rollNo: string | null;
  recruitment: { code: string; title: string };
  post: { id: number; code: string; name: string };
  result: {
    rank: number | null;
    categoryRank: number | null;
    totalMarks: number | null;
    status?: string | null;
  };
};

export default function CandidateResultsPage() {
  const { token, ready } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<MyResultRow[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    let c = false;
    (async () => {
      try {
        const data = await apiFetch<MyResultRow[]>("/api/results/me", { token });
        if (!c) setRows(data);
      } catch (e) {
        if (!c) setErr(e instanceof Error ? e.message : "Failed to load results");
      }
    })();
    return () => {
      c = true;
    };
  }, [ready, token, router]);

  if (!ready || !token) return null;

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toUpperCase()) {
      case "PASS":
        return "bg-green-100 text-green-800";
      case "FAIL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600 mt-1">Check your examination results and rankings</p>
        </div>
        <Link href="/candidate" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {!rows ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading results...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">No results available yet.</p>
          <p className="text-sm text-gray-500 mt-2">Results will appear here once your examination is evaluated.</p>
          <Link href="/results" className="text-blue-900 hover:text-blue-950 font-medium mt-4 inline-block">
            Check Public Results →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.applicationId} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Section */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase">{r.recruitment.code}</div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{r.post.name}</h3>
                  <p className="text-sm text-gray-600">{r.post.code}</p>
                </div>

                {/* Right Section - Results */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">ROLL NO</p>
                      <p className="font-mono text-lg font-bold text-gray-900 mt-1">{r.rollNo ?? "—"}</p>
                    </div>
                    {r.result.status && (
                      <span className={`px-3 py-1 rounded font-semibold text-sm ${getStatusColor(r.result.status)}`}>
                        {r.result.status}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">MARKS</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{r.result.totalMarks ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">RANK</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {r.result.rank ? `#${r.result.rank}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
