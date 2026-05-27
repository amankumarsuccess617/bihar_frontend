import { apiBase } from "@/lib/api";

type Notice = {
  id: number;
  title: string;
  body?: string | null;
  category?: string | null;
  department?: string | null;
  publishedAt?: string | null;
  isImportant?: boolean;
};

async function fetchNotices(): Promise<Notice[]> {
  const res = await fetch(`${apiBase()}/api/notices`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load notices");
  return res.json();
}

export default async function NoticesPage() {
  let items: Notice[] = [];
  let err = "";
  try {
    items = await fetchNotices();
  } catch (e) {
    err = e instanceof Error ? e.message : "Error";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Notices</h1>
        <p className="mt-1 text-sm text-slate-600">
          Published announcements from the department.
        </p>
      </div>
      {err && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {err} — ensure the API is running at {apiBase()}.
        </p>
      )}
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((n) => (
          <li key={n.id} className="px-4 py-4">
            <div className="flex flex-wrap items-baseline gap-2">
              {n.isImportant && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                  Important
                </span>
              )}
              <h2 className="font-medium text-slate-900">{n.title}</h2>
              {n.publishedAt && (
                <span className="text-xs text-slate-500">
                  {new Date(n.publishedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              {n.category && <span>Category: {n.category}</span>}
              {n.department && <span>Dept: {n.department}</span>}
            </div>
            {n.body && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {n.body}
              </p>
            )}
          </li>
        ))}
      </ul>
      {!err && items.length === 0 && (
        <p className="text-sm text-slate-500">No notices published yet.</p>
      )}
    </div>
  );
}
