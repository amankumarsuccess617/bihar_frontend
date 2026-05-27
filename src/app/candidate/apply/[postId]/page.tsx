"use client";

import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Alert } from "@/components/Alert";
import { useAuth } from "@/providers/AuthProvider";

export default function StartApplicationPage(props: {
  params: Promise<{ postId: string }>;
}) {
  const { postId: postIdRaw } = use(props.params);

  const postId = Number(postIdRaw);

  const { token, ready } = useAuth();

  const router = useRouter();

  const [err, setErr] = useState("");

  const [busy, setBusy] = useState(false);

  const [post, setPost] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await apiFetch<any>(
          `/api/posts/${postId}`
        );

        setPost(data);
      } catch (e) {
        setErr(
          e instanceof Error
            ? e.message
            : "Failed to load post"
        );
      } finally {
        setLoading(false);
      }
    }

    if (postId > 0) {
      loadPost();
    }
  }, [postId]);

  async function start() {
    if (!token) {
      router.push("/login");
      return;
    }

    setErr("");

    setBusy(true);

    try {
      type AppDraft = {
        id: number;
      };

      const app = await apiFetch<AppDraft>(
        "/api/applications/draft",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            postId,
          }),
        }
      );

      router.replace(
        `/candidate/application/${app.id}`
      );
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : "Could not create draft"
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  if (!token) {
    router.replace("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">
          Loading post...
        </p>
      </div>
    );
  }

  if (
    !postId ||
    postId <= 0 ||
    !post
  ) {
    return (
      <Alert type="error">
        Invalid post
      </Alert>
    );
  }

  // RECRUITMENT EXPIRED
  if (
    post.recruitment?.isExpired ||
    post.recruitment?.status?.status ===
      "EXPIRED"
  ) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm">

        <h1 className="text-2xl font-bold text-red-700">
          Applications Closed
        </h1>

        <p className="mt-3 text-sm text-red-600">
          The application deadline for this
          recruitment has expired.
        </p>

        {post.recruitment?.endAt && (
          <p className="mt-2 text-sm font-medium text-red-700">
            Last Date:
            {" "}
            {new Date(
              post.recruitment.endAt
            ).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  // RECRUITMENT NOT STARTED
  if (
    post.recruitment?.status?.status ===
    "NOT_STARTED"
  ) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-yellow-200 bg-yellow-50 p-8 shadow-sm">

        <h1 className="text-2xl font-bold text-yellow-700">
          Applications Not Started
        </h1>

        <p className="mt-3 text-sm text-yellow-700">
          Recruitment applications will open
          soon.
        </p>

        {post.recruitment?.startAt && (
          <p className="mt-2 text-sm font-medium text-yellow-700">
            Start Date:
            {" "}
            {new Date(
              post.recruitment.startAt
            ).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  // RECRUITMENT DISABLED
  if (!post.isActive) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-gray-50 p-8 shadow-sm">

        <h1 className="text-2xl font-bold text-gray-700">
          Recruitment Disabled
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          This recruitment is currently
          unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

      <p className="text-xs uppercase text-blue-700">
        {post.recruitment?.code}
      </p>

      <h1 className="mt-1 text-2xl font-bold text-slate-900">
        {post.name}
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        Recruitment:
        {" "}
        {post.recruitment?.title}
      </p>

      <div className="mt-6 rounded-lg border bg-slate-50 p-4">

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Post Code
          </span>

          <span className="font-semibold text-slate-900">
            {post.code}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Vacancies
          </span>

          <span className="font-semibold text-slate-900">
            {post.vacancies}
          </span>
        </div>

        {post.recruitment?.startAt && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Start Date
            </span>

            <span className="font-medium text-slate-900">
              {new Date(
                post.recruitment.startAt
              ).toLocaleString()}
            </span>
          </div>
        )}

        {post.recruitment?.endAt && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Last Date
            </span>

            <span className="font-medium text-red-600">
              {new Date(
                post.recruitment.endAt
              ).toLocaleString()}
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Status
          </span>

          <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
            {
              post.recruitment?.status
                ?.label
            }
          </span>
        </div>
      </div>

      {err && (
        <div className="mt-5">
          <Alert type="error">
            {err}
          </Alert>
        </div>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => void start()}
        className="mt-6 w-full rounded-md bg-blue-700 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-50"
      >
        {busy
          ? "Creating Application..."
          : "Start Application"}
      </button>
    </div>
  );
}