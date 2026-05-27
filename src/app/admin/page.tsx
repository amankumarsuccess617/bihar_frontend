"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch, apiBase } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface DashboardStats {
  totalRecruitments?: number;
  totalApplications?: number;
  totalNotices?: number;
  totalPosts?: number;
}

export default function AdminDashboard() {
  const { token, user, ready } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dash, setDash] = useState<unknown>(null);

  const isAdmin =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // recruitment
  const [recCode, setRecCode] = useState("");
  const [recTitle, setRecTitle] = useState("");
  const [recDescription, setRecDescription] = useState("");

const [recStartAt, setRecStartAt] = useState("");

const [recEndAt, setRecEndAt] = useState("");
  const [recruitmentIdForPost, setRecruitmentIdForPost] = useState("");
  const [postCode, setPostCode] = useState("");
  const [postName, setPostName] = useState("");
  const [postVacancies, setPostVacancies] = useState("0");
  const [feeRulesJson, setFeeRulesJson] = useState(
    '{\n  "GENERAL": 500,\n  "OBC": 400\n}\n'
  );

  // notice
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeIdPublish, setNoticeIdPublish] = useState("");

  // admits / zip
  // const [postIdAdmit, setPostIdAdmit] = useState("");
// admits / zip
const [postIdAdmit, setPostIdAdmit] = useState("");
const [examDate, setExamDate] = useState("");
const [shift, setShift] = useState("Morning");
const [centers, setCenters] = useState(
  "Patna Center 1, Patna Center 2, Gaya Center"
);
  // results bulk JSON
  const [bulkPostId, setBulkPostId] = useState("");
  const [bulkJson, setBulkJson] =
    useState(`[\n  { "rollNo": "...", "totalMarks": 80, "rank": 1, "status": "QUALIFIED" }\n]\n`);

  // refund / invoice regen / applications filter
  const [paymentIdRefund, setPaymentIdRefund] = useState("");
  const [amountPaiseRefund, setAmountPaiseRefund] = useState("500");
  const [paymentIdInvoice, setPaymentIdInvoice] = useState("");
  const [appFilters, setAppFilters] = useState({
    status: "",
    postId: "",
    recruitmentId: "",
    userId: "",
  });

  const [financeJson, setFinanceJson] = useState("");
  const [adminAppsPreview, setAdminAppsPreview] = useState("");

  // CMS
  const [pageSlug, setPageSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageHtml, setPageHtml] = useState("<p>...</p>");
  const [pageStatus, setPageStatus] = useState("PUBLISHED");


useEffect(() => {
  setMounted(true);
}, []);

  useEffect(() => {
    if (!ready) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/candidate");
    }
  }, [ready, token, user, isAdmin, router]);

  async function toastable(action: () => Promise<void>) {
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!ready || !token || !isAdmin) return;
    void (async () => {
      try {
        const d = await apiFetch("/api/admin/dashboard", { token });
        setDash(d);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Dashboard failed");
      }
    })();
  }, [ready, token, isAdmin]);

if (!mounted) {
  return null;
}

if (!ready) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-600">
        Loading dashboard...
      </p>
    </div>
  );
}

if (!token || !user) {
  return null;
}

if (!isAdmin) {
  return null;
}

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin console</h1>
          <p className="mt-1 text-sm text-slate-600">
            Logged in as {user.email} ({user.role}). Opens only for{" "}
            <code className="rounded bg-slate-100 px-1">ADMIN</code> roles set in DB.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/candidate" className="text-sm text-blue-700 underline">
            Candidate view
          </Link>
          <Link href="/recruitments" className="text-sm text-blue-700 underline">
            Public recruitments
          </Link>
          <Link
  href="/admin/posts"
  className="text-sm text-blue-700 underline"
>
  Manage Posts
</Link>
          <Link
  href="/admin/results"
  className="text-sm text-blue-700 underline"
>
  Manage Result
</Link>
<Link
  href="/admin/recruitments"
  className="text-sm text-blue-700 underline"
>
  Manage Recruitments
</Link>
<Link
  href="/admin/refunds"
  className="text-sm text-blue-700 underline"
>
  Manage Refunds
</Link>
<Link
  href="/admin/reports"
  className="text-sm text-blue-700 underline"
>
  Manage Reports
</Link>
<Link
  href="/admin/payments"
  className="text-sm text-blue-700 underline"
>
  Manage Payments
</Link>
<Link
  href="/admin/applications"
  className="text-sm text-blue-700 underline"
>
  Manage Applications
</Link>
<Link
  href="/admin/admit-cards"
  className="text-sm text-blue-700 underline"
>
  Manage Admit Cards
</Link>
        </div>
      </div>

      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="success">{msg}</Alert>}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void toastable(async () => {
                const d = await apiFetch("/api/admin/dashboard", { token });
                setDash(d);
                setMsg("Dashboard refreshed.");
              })
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh JSON
          </button>
        </div>
        {dash ? (
          <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(dash, null, 2)}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Finance summary</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void toastable(async () => {
                const s = await apiFetch(`/api/finance/summary`, { token });
                setFinanceJson(JSON.stringify(s, null, 2));
                setMsg("Loaded finance summary.");
              })
            }
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Fetch /api/finance/summary
          </button>
        </div>
        {financeJson && (
          <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {financeJson}
          </pre>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Downloads use bearer token headers from in-browser fetch → blob save.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["applications.csv", "/api/reports/applications.csv"],
              ["results.csv", "/api/reports/results.csv"],
              ["finance-payments.csv", "/api/finance/payments.csv"],
              ["finance-refunds.csv", "/api/finance/refunds.csv"],
              ["finance-invoices.csv", "/api/finance/invoices.csv"],
            ] as const
          ).map(([name, path]) => (
            <button
              key={name}
              type="button"
              disabled={busy}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50"
              onClick={() =>
                void toastable(async () => {
                  const blob = await apiFetch<Blob>(path, { token });
                  downloadBlob(blob, name);
                  setMsg(`Downloaded ${name}`);
                })
              }
            >
              Download {name}
            </button>
          ))}
          <button
            type="button"
            disabled={busy || !postIdAdmit}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50"
            onClick={() =>
              void toastable(async () => {
                const id = Number(postIdAdmit);
                const blob = await apiFetch<Blob>(
                  `/api/admit-cards/zip/post/${id}`,
                  { token }
                );
                downloadBlob(blob, `admit-cards-post-${id}.zip`);
                setMsg(`Downloaded admit ZIP for post ${id}`);
              })
            }
          >
            Download admit ZIP (uses Post ID below)
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Recruitment + post setup
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Create advertisement, then add posts with fee rules (paise in JSON).
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              Advertisement code / title
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. BPSC-2026-01"
              value={recCode}
              onChange={(e) => setRecCode(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Title"
              value={recTitle}
              onChange={(e) => setRecTitle(e.target.value)}
            />
            <textarea
  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
  placeholder="Recruitment description"
  value={recDescription}
  onChange={(e) =>
    setRecDescription(e.target.value)
  }
/>

<div className="grid grid-cols-2 gap-3">

  <div>

    <label className="mb-1 block text-xs font-medium text-slate-700">
      Start Date
    </label>

    <input
      type="datetime-local"
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      value={recStartAt}
      onChange={(e) =>
        setRecStartAt(e.target.value)
      }
    />

  </div>

  <div>

    <label className="mb-1 block text-xs font-medium text-slate-700">
      End Date
    </label>

    <input
      type="datetime-local"
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      value={recEndAt}
      onChange={(e) =>
        setRecEndAt(e.target.value)
      }
    />

  </div>

</div>
            <button
              type="button"
              disabled={busy || !recCode || !recTitle}
              onClick={() =>
                void toastable(async () => {
                  const r = await apiFetch("/api/recruitments", {
                    method: "POST",
                    token,
                   body: JSON.stringify({
  code: recCode.trim(),

  title: recTitle.trim(),

  description:
    recDescription.trim(),

  startAt:
    recStartAt || null,

  endAt:
    recEndAt || null,

  isActive: true,
}),
                  });
                  setMsg(`Created recruitment id ${JSON.stringify(r)}`);
                  const dashNext = await apiFetch("/api/admin/dashboard", {
                    token,
                  });
                  setDash(dashNext);
                })
              }
              className="w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              POST /api/recruitments
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              recruitmentId · postCode · postName · vacancies
            </label>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="recruitmentId (numeric)"
              value={recruitmentIdForPost}
              onChange={(e) => setRecruitmentIdForPost(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="postCode"
              value={postCode}
              onChange={(e) => setPostCode(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="postName"
              value={postName}
              onChange={(e) => setPostName(e.target.value)}
            />
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={postVacancies}
              onChange={(e) => setPostVacancies(e.target.value)}
            />
            <label className="block text-xs font-medium text-slate-700">
              feeRules JSON (backend expects values in paise; e.g. ₹5.00 → 500)
            </label>
            <textarea
              className="h-32 w-full rounded-md border border-slate-300 p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-200"
              value={feeRulesJson}
              onChange={(e) => setFeeRulesJson(e.target.value)}
            />
            <button
              type="button"
              disabled={busy || !recruitmentIdForPost || !postCode || !postName}
              onClick={() =>
                void toastable(async () => {
                  const rid = Number(recruitmentIdForPost);
                  let feeRules: unknown = null;
                  try {
                    feeRules = JSON.parse(feeRulesJson);
                  } catch {
                    throw new Error("Invalid feeRules JSON");
                  }

                  await apiFetch(`/api/posts/recruitment/${rid}`, {
                    method: "POST",
                    token,
                    body: JSON.stringify({
                      code: postCode.trim(),
                      name: postName.trim(),
                      vacancies: Number(postVacancies || 0),
                      feeRules,
                      formSchema: null,
                      isActive: true,
                    }),
                  });
                  setMsg("Post created.");
                  const dashNext = await apiFetch("/api/admin/dashboard", {
                    token,
                  });
                  setDash(dashNext);
                })
              }
              className="w-full rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              POST /api/posts/recruitment/:id
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Notice draft → publish</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <textarea
            className="rounded-md border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Title"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
          />
          <textarea
            className="h-28 rounded-md border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Body"
            value={noticeBody}
            onChange={(e) => setNoticeBody(e.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !noticeTitle}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={() =>
              void toastable(async () => {
                const n = await apiFetch(`/api/notices`, {
                  method: "POST",
                  token,
                  body: JSON.stringify({
                    title: noticeTitle.trim(),
                    body: noticeBody.trim() || null,
                    isImportant: false,
                  }),
                });
                setMsg(`Notice draft created: ${JSON.stringify(n)}`);
              })
            }
          >
            Create draft
          </button>
          <input
            type="number"
            className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="notice id to publish"
            value={noticeIdPublish}
            onChange={(e) => setNoticeIdPublish(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !noticeIdPublish}
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            onClick={() =>
              void toastable(async () => {
                const id = Number(noticeIdPublish);
                await apiFetch(`/api/notices/${id}/publish`, {
                  method: "POST",
                  token,
                  body: JSON.stringify({}),
                });
                setMsg("Notice published.");
              })
            }
          >
            Publish now
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Applications (admin listing)</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {(["status", "postId", "recruitmentId", "userId"] as const).map((k) => (
            <input
              key={k}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={k}
              value={appFilters[k]}
              onChange={(e) =>
                setAppFilters((p) => ({ ...p, [k]: e.target.value }))
              }
            />
          ))}
        </div>
        <button
          type="button"
          className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void toastable(async () => {
              const q = new URLSearchParams();
              if (appFilters.status) q.set("status", appFilters.status);
              if (appFilters.postId) q.set("postId", appFilters.postId);
              if (appFilters.recruitmentId)
                q.set("recruitmentId", appFilters.recruitmentId);
              if (appFilters.userId) q.set("userId", appFilters.userId);
              const items = await apiFetch(`/api/applications/admin?${q.toString()}`, {
                token,
              });
              setAdminAppsPreview(JSON.stringify(items, null, 2));
              setMsg("Loaded applications preview.");
            })
          }
        >
          Fetch (preview below)
        </button>
        {adminAppsPreview && (
          <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {adminAppsPreview}
          </pre>
        )}
      </section>

     <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

  <div className="flex items-center justify-between">

    <div>

      <h2 className="text-2xl font-bold text-slate-900">
        Admit Card Management
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Generate admit cards automatically for all eligible candidates
      </p>

    </div>

  </div>

  <div className="mt-6 grid gap-5 md:grid-cols-2">

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Post ID
      </label>

      <input
        type="number"
        value={postIdAdmit}
        onChange={(e) => setPostIdAdmit(e.target.value)}
        placeholder="Enter Post ID"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Exam Date
      </label>

      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Exam Shift
      </label>

      <select
        value={shift}
        onChange={(e) => setShift(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      >
        <option value="Morning">
          Morning Shift
        </option>

        <option value="Afternoon">
          Afternoon Shift
        </option>

        <option value="Evening">
          Evening Shift
        </option>

      </select>

    </div>

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Exam Centers
      </label>

      <textarea
        value={centers}
        onChange={(e) => setCenters(e.target.value)}
        placeholder="Separate centers with comma"
        className="h-28 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-600"
      />

    </div>

  </div>

  <div className="mt-6 flex flex-wrap gap-4">

    <button
      type="button"
      disabled={
        busy ||
        !postIdAdmit ||
        !examDate ||
        !shift ||
        !centers
      }
      className="rounded-xl bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:opacity-50"
      onClick={() =>
        void toastable(async () => {

          await apiFetch(
            `/api/admit-cards/generate/post/${Number(postIdAdmit)}`,
            {
              method: "POST",
              token,
              body: JSON.stringify({
                examDate,
                shift,
                centers: centers
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean),
              }),
            }
          );

          setMsg(
            `Admit cards generated successfully for Post ID ${postIdAdmit}`
          );

        })
      }
    >
      Generate Admit Cards
    </button>

    <button
      type="button"
      disabled={busy || !postIdAdmit}
      className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      onClick={() =>
        void toastable(async () => {

          const id = Number(postIdAdmit);

          const blob = await apiFetch<Blob>(
            `/api/admit-cards/zip/post/${id}`,
            { token }
          );

          downloadBlob(
            blob,
            `admit-cards-post-${id}.zip`
          );

          setMsg(
            `Admit card ZIP downloaded for Post ${id}`
          );

        })
      }
    >
      Download Admit ZIP
    </button>

  </div>

  <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

    <h3 className="text-sm font-semibold text-blue-900">
      Instructions
    </h3>

    <ul className="mt-2 space-y-1 text-sm text-blue-800">

      <li>
        • Only PAYMENT_SUCCESS candidates will get admit cards
      </li>

      <li>
        • Roll numbers will be generated automatically
      </li>

      <li>
        • Centers will be assigned randomly
      </li>

      <li>
        • Candidates can download admit card from dashboard
      </li>

    </ul>

  </div>

  <div className="mt-8 space-y-2">

    <label className="block text-xs font-medium text-slate-700">
      Bulk upload results JSON (/api/results/bulk-upload)
    </label>

    <input
      type="number"
      className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      placeholder="postId"
      value={bulkPostId}
      onChange={(e) => setBulkPostId(e.target.value)}
    />

    <textarea
      className="h-44 w-full rounded-md border border-slate-300 p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-200"
      value={bulkJson}
      onChange={(e) => setBulkJson(e.target.value)}
    />

    <button
      type="button"
      disabled={busy || !bulkPostId}
      className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
      onClick={() =>
        void toastable(async () => {

          let results: unknown;

          try {
            results = JSON.parse(bulkJson);
          } catch {
            throw new Error("bulk JSON invalid");
          }

          const resp = await apiFetch(
            `/api/results/bulk-upload`,
            {
              method: "POST",
              token,
              body: JSON.stringify({
                postId: Number(bulkPostId),
                results,
              }),
            }
          );

          setMsg(
            `bulk-upload: ${JSON.stringify(resp)}`
          );

        })
      }
    >
      Submit JSON Bulk Results
    </button>

  </div>

</section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Refund + invoice regenerate</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="paymentId (DB id)"
              value={paymentIdRefund}
              onChange={(e) => setPaymentIdRefund(e.target.value)}
            />
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="amountPaise"
              value={amountPaiseRefund}
              onChange={(e) => setAmountPaiseRefund(e.target.value)}
            />
            <button
              type="button"
              disabled={busy || !paymentIdRefund}
              className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 hover:bg-red-100 disabled:opacity-50"
              onClick={() =>
                void toastable(async () => {
                  const rf = await apiFetch(`/api/refunds/payments/${Number(paymentIdRefund)}`, {
                    method: "POST",
                    token,
                    body: JSON.stringify({
                      amountPaise: Number(amountPaiseRefund || 0),
                      reason: "admin-ui",
                      notes: { via: "frontend" },
                    }),
                  });
                  setMsg(`Refund: ${JSON.stringify(rf)}`);
                })
              }
            >
              POST /api/refunds/payments/:paymentId
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="paymentId regenerate invoice"
              value={paymentIdInvoice}
              onChange={(e) => setPaymentIdInvoice(e.target.value)}
            />
            <button
              type="button"
              disabled={busy || !paymentIdInvoice}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
              onClick={() =>
                void toastable(async () => {
                  const inv = await apiFetch(`/api/invoices/regenerate/payment/${Number(paymentIdInvoice)}`, {
                    method: "POST",
                    token,
                    body: JSON.stringify({}),
                  });
                  setMsg(`Invoice: ${JSON.stringify(inv)}`);
                })
              }
            >
              POST /api/invoices/regenerate/payment/:paymentId
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">CMS page upsert</h2>
        <div className="mt-3 grid gap-3">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="slug"
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value)}
            />
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="title"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
            />
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={pageStatus}
              onChange={(e) => setPageStatus(e.target.value)}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <textarea
            className="h-44 rounded-md border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            value={pageHtml}
            onChange={(e) => setPageHtml(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !pageSlug || !pageTitle}
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            onClick={() =>
              void toastable(async () => {
                const p = await apiFetch(`/api/pages`, {
                  method: "POST",
                  token,
                  body: JSON.stringify({
                    slug: pageSlug.trim(),
                    title: pageTitle.trim(),
                    contentHtml: pageHtml,
                    status: pageStatus,
                    pinned: false,
                  }),
                });
                setMsg(`Page upsert OK: ${JSON.stringify(p)}`);
              })
            }
          >
            POST /api/pages
          </button>
        </div>
      </section>
    </div>
  );
}
function ExcelBulk(props: {
  token: string;
  busy: boolean;
  toastable: (fn: () => Promise<void>) => Promise<void>;
  onParsed?: (parsed: unknown) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="mt-3 space-y-2">
      <input
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        disabled={props.busy}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-white disabled:opacity-50"
        disabled={props.busy || !file}
        onClick={() =>
          void props.toastable(async () => {
            const fd = new FormData();
            fd.append("file", file!);
            const res = await fetch(
              `${apiBase()}/api/results/excel/bulk-upload-excel`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${props.token}` },
                body: fd,
              }
            );
            const txt = await res.text();
            if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
            let parsed: unknown = txt;
            try {
              parsed = txt ? JSON.parse(txt) : null;
            } catch {
              parsed = txt;
            }
            props.onParsed?.(parsed);
          })
        }
      >
        Upload excel
      </button>
      <p className="text-slate-500">
        Parses JSON/Text response into the green success toast above when possible.
      </p>
    </div>
  );
}
