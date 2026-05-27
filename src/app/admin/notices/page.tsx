"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Notice = {
  id: number;
  title: string;
  body?: string | null;
  isImportant?: boolean;
  publishedAt?: string | null;
};

export default function AdminNotices() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!ready || !token || !isAdmin) {
      if (ready && (!token || !isAdmin)) {
        router.replace("/");
      }
      return;
    }
    loadNotices();
  }, [ready, token, isAdmin, router]);

  async function loadNotices() {
    setLoading(true);
    try {
      const data = await apiFetch<Notice[]>("/api/notices", { token });
      setNotices(data || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const newNotice = await apiFetch<Notice>("/api/notices", {
        method: "POST",
        token,
        body: JSON.stringify({ title: title.trim(), body: body.trim() || null, isImportant }),
      });
      setMsg("Notice created successfully!");
      setNotices([newNotice, ...notices]);
      setTitle("");
      setBody("");
      setIsImportant(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  async function publishNotice(id: number) {
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`/api/notices/${id}/publish`, {
        method: "POST",
        token,
        body: JSON.stringify({}),
      });
      setMsg("Notice published successfully!");
      loadNotices();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
          <p className="text-gray-600 mt-1">Create and publish important notices</p>
        </div>
        <Link href="/admin" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="success">{msg}</Alert>}

      {/* Create Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Notice</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="Notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <textarea
              placeholder="Notice content"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none h-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="important"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="important" className="text-sm text-gray-700">
              Mark as important
            </label>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded font-medium disabled:opacity-50"
          >
            {busy ? "Creating..." : "Create Notice"}
          </button>
        </form>
      </div>

      {/* Notices List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Notices ({notices.length})</h2>
        </div>
        {loading ? (
          <p className="p-6 text-gray-600">Loading...</p>
        ) : notices.length === 0 ? (
          <p className="p-6 text-gray-600">No notices yet.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {notices.map((notice) => (
              <div key={notice.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {notice.isImportant && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          Important
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900">{notice.title}</h3>
                    </div>
                    {notice.body && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{notice.body}</p>
                    )}
                  </div>
                  <button
                    onClick={() => publishNotice(notice.id)}
                    disabled={busy}
                    className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                  >
                    {notice.publishedAt ? "Re-publish" : "Publish"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {notice.publishedAt
                    ? `Published: ${new Date(notice.publishedAt).toLocaleString("en-IN")}`
                    : "Not published"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
