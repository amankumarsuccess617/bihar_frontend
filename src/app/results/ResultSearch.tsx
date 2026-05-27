"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Alert } from "@/components/Alert";

type MeritRow = {
  rollNo: string | null;
  candidateName: string;
  totalMarks: number | null;
  rank: number | null;
  categoryRank: number | null;
};

type Recruitment = {
  id: number;
  code: string;
  title: string;
};

type Post = {
  id: number;
  code: string;
  name: string;
  recruitment: Recruitment;
};

export function ResultSearch() {
  const [rollNo, setRollNo] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Merit list states
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [selectedRecId, setSelectedRecId] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [merit, setMerit] = useState<MeritRow[] | null>(null);
  const [mErr, setMErr] = useState("");
  const [recLoading, setRecLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [mLoad, setMLoad] = useState(false);

  // Load recruitments on mount
  useEffect(() => {
    loadRecruitments();
  }, []);

  async function loadRecruitments() {
    try {
      setRecLoading(true);
      const data = await apiFetch<Recruitment[]>("/api/recruitments");
      setRecruitments(data || []);
    } catch (err) {
      console.error("Failed to load recruitments", err);
    } finally {
      setRecLoading(false);
    }
  }

  async function handleRecuitmentChange(recId: string) {
    setSelectedRecId(recId);
    setSelectedPostId("");
    setPosts([]);
    setMerit(null);

    if (!recId) return;

    try {
      setPostsLoading(true);
      const data = await apiFetch<Post[]>(
        `/api/posts/recruitment/${recId}`
      );
      setPosts(data || []);
    } catch (err) {
      console.error("Failed to load posts", err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }

  async function handlePostChange(postId: string) {
    setSelectedPostId(postId);
    setMerit(null);
    setMErr("");
  }

  async function searchRoll(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!rollNo.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch(
        `/api/results/roll/${encodeURIComponent(rollNo.trim())}`
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadMerit(e: React.FormEvent) {
    e.preventDefault();
    setMErr("");
    setMerit(null);
    
    if (!selectedPostId) {
      setMErr("Please select a post first");
      return;
    }

    setMLoad(true);
    try {
      const data = await apiFetch<MeritRow[]>(
        `/api/results/merit/post/${selectedPostId}?limit=200`
      );
      setMerit(data);
    } catch (err) {
      setMErr(err instanceof Error ? err.message : "Merit fetch failed");
    } finally {
      setMLoad(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">By roll number</h2>
        <p className="mt-1 text-sm text-slate-600">
          Public lookup — roll number comes from admit card after generation.
        </p>
        <form className="mt-4 flex flex-wrap gap-2" onSubmit={searchRoll}>
          <input
            className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Roll number"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
        {error && (
          <div className="mt-3">
            <Alert type="error">{error}</Alert>
          </div>
        )}
        {result != null ? (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Merit list (by recruitment & post)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Select recruitment, then choose post to view merit list.
        </p>

        <div className="mt-4 space-y-3">
          {/* Step 1: Select Recruitment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              1️⃣ Select Recruitment
            </label>
            {recLoading ? (
              <div className="px-3 py-2 text-sm text-slate-500 bg-slate-50 rounded border border-slate-300">
                Loading recruitments...
              </div>
            ) : (
              <select
                value={selectedRecId}
                onChange={(e) => handleRecuitmentChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">-- Choose recruitment --</option>
                {recruitments.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.code} - {rec.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Select Post */}
          {selectedRecId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                2️⃣ Select Post
              </label>
              {postsLoading ? (
                <div className="px-3 py-2 text-sm text-slate-500 bg-slate-50 rounded border border-slate-300">
                  Loading posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500 bg-slate-50 rounded border border-slate-300">
                  No posts available for this recruitment
                </div>
              ) : (
                <select
                  value={selectedPostId}
                  onChange={(e) => handlePostChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">-- Choose post --</option>
                  {posts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.code} - {post.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 3: Load Merit List */}
          {selectedPostId && (
            <button
              onClick={loadMerit}
              disabled={mLoad}
              className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-md text-sm font-medium transition"
            >
              {mLoad ? "Loading merit list…" : "3️⃣ Load Merit List"}
            </button>
          )}
        </div>

        {mErr && (
          <div className="mt-3">
            <Alert type="error">{mErr}</Alert>
          </div>
        )}

        {merit && merit.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No qualified candidates yet.</p>
        )}

        {merit && merit.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <p className="text-xs text-slate-600 mb-3 font-semibold">
              Merit List - {posts.find((p) => p.id === Number(selectedPostId))?.name}
            </p>
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  <th className="px-2 py-2">Rank</th>
                  <th className="px-2 py-2">Roll</th>
                  <th className="px-2 py-2">Candidate Name</th>
                  <th className="px-2 py-2">Marks</th>
                  <th className="px-2 py-2">Cat Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {merit.map((r, i) => (
                  <tr key={`${r.rollNo}-${i}`} className="hover:bg-slate-50">
                    <td className="px-2 py-2 font-semibold text-blue-600">
                      {r.rank ?? "—"}
                    </td>
                    <td className="px-2 py-2">{r.rollNo ?? "—"}</td>
                    <td className="px-2 py-2 font-medium text-slate-900">
                      {r.candidateName}
                    </td>
                    <td className="px-2 py-2 text-right">{r.totalMarks ?? "—"}</td>
                    <td className="px-2 py-2">{r.categoryRank ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
