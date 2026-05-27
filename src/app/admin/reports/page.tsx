"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Report = {
  id: number;
  type: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  generatedAt: string;
  fileUrl?: string;
  recordCount: number;
};

type Post = {
  id: number;
  code: string;
  name: string;
};

type Recruitment = {
  id: number;
  code: string;
  title: string;
};

const REPORT_TYPES = [
  { id: "applications", label: "Applications Report", description: "List of all applications" },
  { id: "results", label: "Results Report", description: "Results and merit list" },
  { id: "payments", label: "Payments Report", description: "Payment collection summary" },
  { id: "refunds", label: "Refunds Report", description: "Refund requests and status" },
  { id: "candidates", label: "Candidates Report", description: "Candidate information" },
];

export default function AdminReports() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRecruitment, setSelectedRecruitment] = useState<number>(0);
  const [selectedPost, setSelectedPost] = useState<number>(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    loadReports();
    loadRecruitments();
  }, [ready, token, isAdmin, router]);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await apiFetch<Report[]>("/api/reports", { token });
      setReports(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  async function loadRecruitments() {
    try {
      const data = await apiFetch<Recruitment[]>("/api/recruitments", { token });
      setRecruitments(data);
    } catch (e) {
      console.error("Failed to load recruitments");
    }
  }

  const handleRecruitmentChange = async (recId: number) => {
    setSelectedRecruitment(recId);
    if (recId) {
      try {
        const data = await apiFetch<Post[]>(`/api/posts/recruitment/${recId}`, { token });
        setPosts(data);
        setSelectedPost(0);
      } catch (e) {
        console.error("Failed to load posts");
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedType) {
      setErr("Please select a report type");
      return;
    }

    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const body: any = {
        type: selectedType,
      };
      if (selectedRecruitment) body.recruitmentId = selectedRecruitment;
      if (selectedPost) body.postId = selectedPost;
      if (dateFrom) body.dateFrom = dateFrom;
      if (dateTo) body.dateTo = dateTo;

      const result = await apiFetch(`/api/reports/generate`, {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });

      setMsg("Report generated successfully");
      setTimeout(() => loadReports(), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
          <p className="text-gray-600 mt-1">Create and download analytical reports</p>
        </div>
        <Link href="/admin" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="success">{msg}</Alert>}

      {/* Report Generation Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Report</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Report Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
            <div className="grid gap-3 md:grid-cols-2">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg border-2 transition text-left ${
                    selectedType === type.id ? "border-blue-900 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="font-bold text-gray-900">{type.label}</h3>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recruitment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recruitment (Optional)</label>
            <select
              value={selectedRecruitment}
              onChange={(e) => handleRecruitmentChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">All Recruitments</option>
              {recruitments.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.code} - {rec.title}
                </option>
              ))}
            </select>
          </div>

          {/* Post Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post (Optional)</label>
            <select
              value={selectedPost}
              onChange={(e) => setSelectedPost(Number(e.target.value))}
              disabled={!selectedRecruitment}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="">All Posts</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.code} - {post.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={busy || !selectedType}
            className="px-6 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded font-medium disabled:opacity-50"
          >
            {busy ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Reports ({reports.length})</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No reports generated yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Report Type</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Records</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Generated</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{report.type}</td>
                    <td className="px-6 py-3 text-gray-600">{report.recordCount}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      {new Date(report.generatedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                          report.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : report.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {report.status === "COMPLETED" && report.fileUrl && (
                        <a
                          href={report.fileUrl}
                          download
                          className="text-blue-900 hover:text-blue-950 font-medium text-sm"
                        >
                          Download
                        </a>
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
