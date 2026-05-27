"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Alert } from "@/components/Alert";
import { useAuth } from "@/providers/AuthProvider";

export default function ApplyToPostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id: postIdRaw } = use(props.params);
  const postId = Number(postIdRaw);
  const { token, ready } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    if (!token) {
      router.push("/login");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      type AppDraft = { id: number };
      const app = await apiFetch<AppDraft>("/api/applications/draft", {
        method: "POST",
        token,
        body: JSON.stringify({ postId }),
      });
      router.replace(`/candidate/application/${app.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create draft");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;
  if (!token) {
    router.replace("/login");
    return null;
  }

  if (!postId || postId <= 0) return <Alert type="error">Invalid post</Alert>;

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900">Start application</h1>
      <p className="text-sm text-gray-600">
        Post ID <span className="font-mono">{postId}</span>. A draft will be
        created if you do not already have one for this post.
      </p>
      {err && <Alert type="error">{err}</Alert>}
      <button
        type="button"
        disabled={busy}
        onClick={() => void start()}
        className="w-full rounded-md bg-blue-700 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {busy ? "Creating…" : "Continue"}
      </button>
    </div>
  );
}
