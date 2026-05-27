"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminDashboard() {
  const { token, user, ready } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!ready) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/candidate");
    }

    // Load dashboard stats
    (async () => {
      try {
        const data = await apiFetch("/api/admin/dashboard", { token });
        setStats(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, token, user, isAdmin, router]);

  if (!ready || !token || !user) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                🎛️ Admin Control Panel
              </h1>
              <p className="mt-2 text-slate-600">
                Welcome, <span className="font-semibold">{user.name}</span> ({user.role})
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Logged as Admin</p>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {err && <Alert type="error">{err}</Alert>}
        {msg && <Alert type="success">{msg}</Alert>}

        {/* Quick Stats */}
        {!loading && stats && (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-12">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Recruitments</p>
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.activeRecruitments || 0}</p>
              <p className="text-xs text-slate-500 mt-2">Active cycles</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Applications</p>
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats.totalApplications || 0}</p>
              <p className="text-xs text-slate-500 mt-2">Total submissions</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Payment Revenue</p>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-green-600">₹{((stats.totalPaymentAmount || 0) / 100).toFixed(0)}</p>
              <p className="text-xs text-slate-500 mt-2">Successful</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Pending Refunds</p>
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{stats.refundsPending || 0}</p>
              <p className="text-xs text-slate-500 mt-2">To process</p>
            </div>
          </div>
        )}

        {/* Main Tools Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📊 Main Operations</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Setup & Configuration */}
            <Link
              href="/admin/recruitments"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-blue-400"
            >
              <div className="mb-4 text-4xl">📋</div>
              <h3 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 mb-2">Recruitments</h3>
              <p className="text-sm text-blue-800 mb-4">Create and manage recruitment cycles</p>
              <p className="text-xs text-blue-700 font-medium">Step 1️⃣ - Do this first</p>
            </Link>

            <Link
              href="/admin/posts"
              className="group bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-emerald-400"
            >
              <div className="mb-4 text-4xl">💼</div>
              <h3 className="text-lg font-bold text-emerald-900 group-hover:text-emerald-700 mb-2">Posts & Positions</h3>
              <p className="text-sm text-emerald-800 mb-4">Define job posts and vacancy details</p>
              <p className="text-xs text-emerald-700 font-medium">Step 2️⃣ - After recruitment</p>
            </Link>

            {/* Communication */}
            <Link
              href="/admin/notices"
              className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-purple-400"
            >
              <div className="mb-4 text-4xl">📢</div>
              <h3 className="text-lg font-bold text-purple-900 group-hover:text-purple-700 mb-2">Notices & Updates</h3>
              <p className="text-sm text-purple-800 mb-4">Publish announcements and important info</p>
              <p className="text-xs text-purple-700 font-medium">Anytime - Keep candidates updated</p>
            </Link>

            {/* Exam Management */}
            <Link
              href="/admin/admit-cards"
              className="group bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-pink-400"
            >
              <div className="mb-4 text-4xl">🎫</div>
              <h3 className="text-lg font-bold text-pink-900 group-hover:text-pink-700 mb-2">Admit Cards</h3>
              <p className="text-sm text-pink-800 mb-4">Generate and distribute admit cards to candidates</p>
              <p className="text-xs text-pink-700 font-medium">After application deadline</p>
            </Link>

            <Link
              href="/admin/results"
              className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-orange-400"
            >
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="text-lg font-bold text-orange-900 group-hover:text-orange-700 mb-2">Results Upload</h3>
              <p className="text-sm text-orange-800 mb-4">Upload exam results using 3-step wizard</p>
              <p className="text-xs text-orange-700 font-medium">After exam completion</p>
            </Link>

            {/* Finance */}
            <Link
              href="/admin/finance"
              className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-green-400"
            >
              <div className="mb-4 text-4xl">💳</div>
              <h3 className="text-lg font-bold text-green-900 group-hover:text-green-700 mb-2">Finance & Payments</h3>
              <p className="text-sm text-green-800 mb-4">Track payments, refunds, and invoices</p>
              <p className="text-xs text-green-700 font-medium">Monitor transactions</p>
            </Link>

            {/* Data Management */}
            <Link
              href="/admin/applications"
              className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-indigo-400"
            >
              <div className="mb-4 text-4xl">📑</div>
              <h3 className="text-lg font-bold text-indigo-900 group-hover:text-indigo-700 mb-2">Applications List</h3>
              <p className="text-sm text-indigo-800 mb-4">Review and manage all candidate applications</p>
              <p className="text-xs text-indigo-700 font-medium">View submissions</p>
            </Link>

            <Link
              href="/admin/users"
              className="group bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-cyan-400"
            >
              <div className="mb-4 text-4xl">👥</div>
              <h3 className="text-lg font-bold text-cyan-900 group-hover:text-cyan-700 mb-2">User Management</h3>
              <p className="text-sm text-cyan-800 mb-4">Manage admin and candidate user accounts</p>
              <p className="text-xs text-cyan-700 font-medium">Access control</p>
            </Link>

            <Link
              href="/admin/pages"
              className="group bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 p-6 hover:shadow-lg transition cursor-pointer hover:border-amber-400"
            >
              <div className="mb-4 text-4xl">📄</div>
              <h3 className="text-lg font-bold text-amber-900 group-hover:text-amber-700 mb-2">CMS Pages</h3>
              <p className="text-sm text-amber-800 mb-4">Create and manage static pages and policies</p>
              <p className="text-xs text-amber-700 font-medium">Website content</p>
            </Link>
          </div>
        </div>

        {/* Workflow Guide */}
        <div className="bg-white rounded-xl border-2 border-slate-300 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📖 Workflow Guide - What to do and when</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <h3 className="font-bold text-slate-900">Create Recruitment</h3>
                <p className="text-sm text-slate-600">Go to <strong>Recruitments</strong> → Create a new recruitment cycle (e.g., "DMG-2026 Recruitment")</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <h3 className="font-bold text-slate-900">Add Posts</h3>
                <p className="text-sm text-slate-600">Go to <strong>Posts & Positions</strong> → Add job positions under the recruitment (e.g., "District Magistrate", "Additional DM")</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <h3 className="font-bold text-slate-900">Publish Notices</h3>
                <p className="text-sm text-slate-600">Go to <strong>Notices & Updates</strong> → Announce the recruitment and important dates</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
              <div>
                <h3 className="font-bold text-slate-900">Generate Admit Cards</h3>
                <p className="text-sm text-slate-600">Go to <strong>Admit Cards</strong> → After payment, generate and send admit cards to qualified candidates</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
              <div>
                <h3 className="font-bold text-slate-900">Upload Results</h3>
                <p className="text-sm text-slate-600">Go to <strong>Results Upload</strong> → Use the 3-step wizard to upload exam results (JSON format with roll numbers, marks, ranks)</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
              <div>
                <h3 className="font-bold text-slate-900">Monitor Finance</h3>
                <p className="text-sm text-slate-600">Go to <strong>Finance & Payments</strong> → Track all payments, generate refunds, and manage invoices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 Tips for Results Upload</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ JSON format with rollNo, totalMarks, rank, status</li>
              <li>✓ Use 3-step wizard for easy entry</li>
              <li>✓ Preview before uploading</li>
              <li>✓ Can upload sample data to test</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6">
            <h3 className="font-bold text-amber-900 mb-2">⚠️ Important Notes</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>✓ Always create Recruitment first</li>
              <li>✓ Add Posts to each Recruitment</li>
              <li>✓ Check finances before processing refunds</li>
              <li>✓ Publish notices to keep candidates informed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
