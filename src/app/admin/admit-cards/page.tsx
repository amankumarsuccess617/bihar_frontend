"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type AdmitCard = {
  id: number;
  rollNo: string;
  applicationId: number;
  postId: number;
  generatedAt: string;
  pdfUrl?: string;
};

type Post = {
  id: number;
  code: string;
  name: string;
  recruitment: {
    code: string;
    title: string;
  };
};

export default function AdminAdmitCards() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
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
    loadPosts();
  }, [ready, token, isAdmin, router]);

  async function loadPosts() {
    setLoading(true);
    try {
      const recs = await apiFetch<any[]>("/api/recruitments", { token });
      let allPosts: Post[] = [];
      for (const rec of recs) {
        const postsData = await apiFetch<Post[]>(`/api/posts/recruitment/${rec.id}`, { token }).catch(() => []);
        allPosts = [...allPosts, ...postsData];
      }
      setPosts(allPosts);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectPost = async (post: Post) => {
    setSelectedPost(post);
    setErr("");
    setMsg("");
    try {
      const cards = await apiFetch<AdmitCard[]>(`/api/admit-cards/post/${post.id}`, { token });
      setAdmitCards(cards);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load admit cards");
    }
  };

  const handleGenerateAdmits = async () => {
    if (!selectedPost) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await apiFetch(`/api/admit-cards/generate/post/${selectedPost.id}`, {
        method: "POST",
        token,
        body: JSON.stringify({}),
      });
      setMsg("Admit cards generation triggered successfully!");
      setTimeout(() => handleSelectPost(selectedPost), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to generate admit cards");
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Admit Cards</h1>
          <p className="text-gray-600 mt-1">Generate and manage admit cards for posts</p>
        </div>
        <Link href="/admin" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="success">{msg}</Alert>}

      {/* Posts Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Post</h2>
        {loading ? (
          <p className="text-gray-600">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-600">No posts available</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => handleSelectPost(post)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedPost?.id === post.id
                    ? "border-blue-900 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="text-xs font-semibold text-gray-600">{post.recruitment.code}</div>
                <h3 className="font-bold text-gray-900">{post.name}</h3>
                <p className="text-sm text-gray-600">{post.recruitment.title}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Generate Admit Cards */}
      {selectedPost && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Admit Cards</h2>
          <p className="text-gray-600 mb-4">
            Post: <strong>{selectedPost.name}</strong> ({selectedPost.code})
          </p>
          <button
            onClick={handleGenerateAdmits}
            disabled={busy}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50"
          >
            {busy ? "Generating..." : "Generate Admit Cards"}
          </button>
        </div>
      )}

      {/* Admit Cards List */}
      {selectedPost && admitCards.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Generated Admit Cards ({admitCards.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Roll No</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Application ID</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Generated</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admitCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-gray-900">{card.rollNo}</td>
                    <td className="px-6 py-3 text-gray-600">{card.applicationId}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(card.generatedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      {card.pdfUrl && (
                        <a
                          href={card.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-900 hover:text-blue-950 font-medium text-sm"
                        >
                          View PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
