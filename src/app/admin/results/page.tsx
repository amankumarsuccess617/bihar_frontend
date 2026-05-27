"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Post = {
  id: number;
  code: string;
  name: string;
  recruitment: {
    code: string;
    title: string;
  };
};

type Step = "select" | "preview" | "upload";

export default function AdminResults() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [manualPostId, setManualPostId] = useState("");
  const [resultsJson, setResultsJson] = useState(`[\n  {\n    "rollNo": "001",\n    "totalMarks": 85,\n    "rank": 1,\n    "status": "QUALIFIED",\n    "categoryRank": 1\n  }\n]\n`);
  const [jsonError, setJsonError] = useState("");
  const [parsedResults, setParsedResults] = useState<any[]>([]);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!ready || !token || !isAdmin) {
      if (ready && (!token || !isAdmin)) {
        router.replace("/");
      }
      return;
    }
    loadPosts();
  }, [ready, token, isAdmin, router]);

  async function loadPosts() {
    setLoading(true);
    setErr("");
    try {
      // Load all posts
      console.log("[LoadPosts] Fetching recruitments...");
      const recs = await apiFetch<any[]>("/api/recruitments", { token });
      console.log("[LoadPosts] Recruitments:", recs);
      
      if (!recs || recs.length === 0) {
        console.warn("[LoadPosts] No recruitments found");
        setPosts([]);
        return;
      }
      
      let allPosts: Post[] = [];
      for (const rec of recs) {
        try {
          console.log(`[LoadPosts] Fetching posts for recruitment ${rec.id}...`);
          const postsData = await apiFetch<Post[]>(`/api/posts/recruitment/${rec.id}`, { token });
          console.log(`[LoadPosts] Got ${postsData?.length || 0} posts for recruitment ${rec.id}`);
          if (postsData && postsData.length > 0) {
            allPosts = [...allPosts, ...postsData];
          }
        } catch (e) {
          console.error(`[LoadPosts] Error fetching posts for recruitment ${rec.id}:`, e);
        }
      }
      console.log("[LoadPosts] Total posts loaded:", allPosts.length);
      setPosts(allPosts);
    } catch (e) {
      console.error("[LoadPosts] Error:", e);
      setErr(e instanceof Error ? e.message : "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  function validateAndParseJson(json: string): { valid: boolean; data?: any[]; error?: string } {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) {
        return { valid: false, error: "JSON must be an array" };
      }
      if (data.length === 0) {
        return { valid: false, error: "Array cannot be empty" };
      }
      for (let i = 0; i < data.length; i++) {
        const obj = data[i];
        if (!obj.rollNo) return { valid: false, error: `Row ${i + 1}: rollNo is required` };
        if (typeof obj.totalMarks !== "number") return { valid: false, error: `Row ${i + 1}: totalMarks must be a number` };
        if (typeof obj.rank !== "number") return { valid: false, error: `Row ${i + 1}: rank must be a number` };
        if (!obj.status) return { valid: false, error: `Row ${i + 1}: status is required` };
      }
      return { valid: true, data };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }

  function handleJsonChange(json: string) {
    setResultsJson(json);
    const validation = validateAndParseJson(json);
    if (validation.valid) {
      setJsonError("");
      setParsedResults(validation.data || []);
    } else {
      setJsonError(validation.error || "Invalid JSON");
      setParsedResults([]);
    }
  }

  function generateSampleData() {
    const samples = [
      { rollNo: "001", totalMarks: 95, rank: 1, status: "QUALIFIED", categoryRank: 1 },
      { rollNo: "002", totalMarks: 88, rank: 2, status: "QUALIFIED", categoryRank: 1 },
      { rollNo: "003", totalMarks: 75, rank: 3, status: "QUALIFIED", categoryRank: 2 },
      { rollNo: "004", totalMarks: 62, rank: 4, status: "NOT_QUALIFIED", categoryRank: null },
    ];
    const json = JSON.stringify(samples, null, 2);
    handleJsonChange(json);
  }

  function getSelectedPost(): Post | undefined {
    const postId = selectedPostId || manualPostId;
    return posts.find(p => p.id === Number(postId));
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    const postId = selectedPostId || manualPostId;
    if (!postId) {
      setErr("Please select or enter a post ID");
      return;
    }

    const validation = validateAndParseJson(resultsJson);
    if (!validation.valid) {
      setErr(validation.error || "Invalid JSON");
      return;
    }

    setErr("");
    setMsg("");
    setBusy(true);

    try {
      const response = await apiFetch<{ upserted: number; failed: number }>("/api/results/bulk-upload", {
        method: "POST",
        token,
        body: JSON.stringify({
          postId: Number(postId),
          results: validation.data,
        }),
      });

      setMsg(`✅ Results uploaded successfully!\n${response?.upserted || 0} records uploaded, ${response?.failed || 0} failed`);
      setCurrentStep("select");
      setResultsJson(`[\n  {\n    "rollNo": "001",\n    "totalMarks": 85,\n    "rank": 1,\n    "status": "QUALIFIED",\n    "categoryRank": 1\n  }\n]\n`);
      setParsedResults([]);
      setSelectedPostId("");
      setManualPostId("");
      setTimeout(() => setMsg(""), 5000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to upload results");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  const selectedPost = getSelectedPost();
  const postId = selectedPostId || manualPostId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">📊 Bulk Upload Results</h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-gray-600">Upload examination results in 3 simple steps</p>
        </div>

        {/* Alerts */}
        {err && <Alert type="error">{err}</Alert>}
        {msg && <Alert type="success">{msg}</Alert>}

        {/* Steps Indicator */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setCurrentStep("select")}
            className={`p-4 rounded-lg text-center transition-all ${
              currentStep === "select"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="text-2xl mb-2">1️⃣</div>
            <div className="font-bold">Select Post</div>
            <div className="text-xs opacity-75">Choose which exam</div>
          </button>

          <button
            onClick={() => postId && setCurrentStep("preview")}
            disabled={!postId}
            className={`p-4 rounded-lg text-center transition-all ${
              currentStep === "preview" && postId
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : postId
                ? "bg-white text-gray-700 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <div className="text-2xl mb-2">2️⃣</div>
            <div className="font-bold">Enter Results</div>
            <div className="text-xs opacity-75">Add candidate data</div>
          </button>

          <button
            onClick={() => parsedResults.length > 0 && setCurrentStep("upload")}
            disabled={parsedResults.length === 0}
            className={`p-4 rounded-lg text-center transition-all ${
              currentStep === "upload" && parsedResults.length > 0
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : parsedResults.length > 0
                ? "bg-white text-gray-700 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <div className="text-2xl mb-2">3️⃣</div>
            <div className="font-bold">Review & Upload</div>
            <div className="text-xs opacity-75">Confirm and submit</div>
          </button>
        </div>

        {/* Step 1: Select Post */}
        {currentStep === "select" && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Select Examination Post</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-orange-900 font-semibold mb-2">No posts found in the system</p>
                <p className="text-orange-800 text-sm mb-4">Use the manual Post ID entry below</p>
                <div className="space-y-2">
                  <label className="block text-left">
                    <span className="text-sm font-semibold text-gray-700">Enter Post ID Manually</span>
                    <input
                      type="number"
                      placeholder="e.g., 5"
                      value={manualPostId}
                      onChange={(e) => setManualPostId(e.target.value)}
                      className="mt-2 w-full border-2 border-orange-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700 font-medium mb-4">Click on a post to select it:</p>
                <div className="grid gap-3">
                  {posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => {
                        setSelectedPostId(String(post.id));
                        setManualPostId("");
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPostId === String(post.id)
                          ? "bg-blue-50 border-blue-500 shadow-md"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{post.recruitment.title}</h3>
                          <p className="text-sm text-gray-600">{post.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Post Code: {post.code}</p>
                        </div>
                        <div className="text-3xl">{selectedPostId === String(post.id) ? "✅" : "◯"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {postId && (
              <button
                onClick={() => setCurrentStep("preview")}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Continue to Results Data →
              </button>
            )}
          </div>
        )}

        {/* Step 2: Enter Results */}
        {currentStep === "preview" && selectedPost && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Enter Results Data</h2>
            <p className="text-gray-600 mb-6">Selected: <span className="font-semibold text-blue-600">{selectedPost.recruitment.title} - {selectedPost.name}</span></p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">Results Data (JSON Format)</label>
                  <button
                    type="button"
                    onClick={generateSampleData}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full font-medium"
                  >
                    📋 Load Sample Data
                  </button>
                </div>
                <textarea
                  value={resultsJson}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className={`w-full border-2 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 outline-none transition-all h-64 ${
                    jsonError
                      ? "border-red-500 focus:ring-red-300 bg-red-50"
                      : jsonError === "" && parsedResults.length > 0
                      ? "border-green-500 focus:ring-green-300 bg-green-50"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder='[\n  {\n    "rollNo": "001",\n    "totalMarks": 85,\n    "rank": 1,\n    "status": "QUALIFIED",\n    "categoryRank": 1\n  }\n]'
                />
                {jsonError && <p className="text-red-600 text-sm mt-2 font-medium">❌ {jsonError}</p>}
                {!jsonError && parsedResults.length > 0 && (
                  <p className="text-green-600 text-sm mt-2 font-medium">✅ {parsedResults.length} records found and valid</p>
                )}
              </div>

              {/* Format Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3">📝 Required Fields:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                  <div>
                    <span className="font-semibold">rollNo</span>
                    <p className="text-xs text-blue-700">String (e.g., "001")</p>
                  </div>
                  <div>
                    <span className="font-semibold">totalMarks</span>
                    <p className="text-xs text-blue-700">Number (e.g., 85)</p>
                  </div>
                  <div>
                    <span className="font-semibold">rank</span>
                    <p className="text-xs text-blue-700">Number (e.g., 1)</p>
                  </div>
                  <div>
                    <span className="font-semibold">status</span>
                    <p className="text-xs text-blue-700">String (e.g., "QUALIFIED")</p>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  Optional: categoryRank (Number for category-wise ranking)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCurrentStep("select")}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => parsedResults.length > 0 && setCurrentStep("upload")}
                disabled={parsedResults.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                Review & Upload →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Upload */}
        {currentStep === "upload" && selectedPost && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Review & Upload</h2>
            <p className="text-gray-600 mb-6">Final check before uploading to: <span className="font-semibold text-blue-600">{selectedPost.recruitment.title}</span></p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{parsedResults.length}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{parsedResults.filter(r => r.status === "QUALIFIED").length}</div>
                <div className="text-sm text-gray-600">Qualified</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{parsedResults.filter(r => r.status !== "QUALIFIED").length}</div>
                <div className="text-sm text-gray-600">Not Qualified</div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Roll No</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Total Marks</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Rank</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedResults.slice(0, 10).map((result, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">{result.rollNo}</td>
                      <td className="px-4 py-3">{result.totalMarks}</td>
                      <td className="px-4 py-3 font-semibold">{result.rank}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.status === "QUALIFIED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedResults.length > 10 && (
                <p className="text-center text-gray-600 text-sm mt-2">... and {parsedResults.length - 10} more records</p>
              )}
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep("preview")}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {busy ? "⏳ Uploading..." : "✅ Confirm & Upload"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
