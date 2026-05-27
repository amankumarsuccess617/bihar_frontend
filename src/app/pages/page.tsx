import Link from "next/link";
import { apiBase } from "@/lib/api";

type PublishedPageMeta = {
  slug: string;
  title: string;
  pinned?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt?: string | null;
};

async function fetchPages(): Promise<PublishedPageMeta[]> {
  const res = await fetch(`${apiBase()}/api/pages/public/list`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load pages");
  return res.json();
}

export default async function CmsPagesIndex() {
  let items: PublishedPageMeta[] = [];
  let err = "";
  try {
    items = await fetchPages();
  } catch (e) {
    err = e instanceof Error ? e.message : "Error";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Information</h1>
        <p className="mt-1 text-sm text-slate-600">
          Static pages published via the CMS API.
        </p>
      </div>
      {err && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {err}
        </p>
      )}
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((p) => (
          <li key={p.slug} className="flex items-center justify-between px-4 py-3">
            <div>
              {p.pinned && (
                <span className="mr-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  Pinned
                </span>
              )}
              <Link
                href={`/pages/${encodeURIComponent(p.slug)}`}
                className="font-medium text-blue-700 hover:text-blue-900"
              >
                {p.title}
              </Link>
              <p className="text-xs text-slate-500">/{p.slug}</p>
            </div>
            {p.updatedAt && (
              <span className="text-xs text-slate-400">
                {new Date(p.updatedAt).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
      </ul>
      {!err && items.length === 0 && (
        <p className="text-sm text-slate-500">No published pages.</p>
      )}
    </div>
  );
}
