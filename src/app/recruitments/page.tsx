import Link from "next/link";
import { apiBase } from "@/lib/api";

type RecruitmentStatus = {
  status: "ACCEPTING" | "NOT_STARTED" | "EXPIRED" | "DISABLED" | "UNKNOWN";
  label: string;
  startDate?: string;
  endDate?: string;
};

type RecruitmentListItem = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  isExpired?: boolean;
  isActive?: boolean;
  posts?: { id: number }[];
  status?: RecruitmentStatus;
};

async function fetchRecruitments(): Promise<RecruitmentListItem[]> {
  const res = await fetch(`${apiBase()}/api/recruitments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load recruitments");
  return res.json();
}

function getStatusBadge(rec: RecruitmentListItem) {
  const status = rec.status?.status || "UNKNOWN";
  const label = rec.status?.label || "Unknown";

  const styles = {
    ACCEPTING: "bg-green-100 text-green-700 border-green-300",
    NOT_STARTED: "bg-yellow-100 text-yellow-700 border-yellow-300",
    EXPIRED: "bg-red-100 text-red-700 border-red-300",
    DISABLED: "bg-gray-100 text-gray-700 border-gray-300",
    UNKNOWN: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <span className={`rounded border px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}

export default async function RecruitmentsPage() {
  let items: RecruitmentListItem[] = [];
  let err = "";
  try {
    items = await fetchRecruitments();
  } catch (e) {
    err = e instanceof Error ? e.message : "Error";
  }

  // Only show accepting recruitments to candidates
  const availableItems = items.filter((r) => r.status?.status === "ACCEPTING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Recruitments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Active advertisement cycles and available posts.
        </p>
      </div>
      {err && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {err}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {availableItems.map((r) => (
          <Link
            key={r.id}
            href={`/recruitments/${encodeURIComponent(r.code)}`}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase text-blue-700">{r.code}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {r.title}
                </h2>
              </div>
              {getStatusBadge(r)}
            </div>
            {r.description && (
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                {r.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Posts: {r.posts?.length ?? "—"}</span>
              {r.endAt && (
                <span>Closes: {new Date(r.endAt).toLocaleString()}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
      {!err && availableItems.length === 0 && (
        <p className="text-sm text-slate-500">
          No active recruitments at the moment.
        </p>
      )}
    </div>
  );
}
