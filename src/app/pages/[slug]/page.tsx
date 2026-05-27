import { notFound } from "next/navigation";
import { apiBase } from "@/lib/api";

type CmsPage = {
  slug: string;
  title: string;
  contentHtml?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

async function fetchPage(slug: string): Promise<CmsPage | null> {
  const res = await fetch(
    `${apiBase()}/api/pages/public/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load page");
  return res.json();
}

export default async function CmsPageView(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  let page: CmsPage | null = null;
  let err = "";
  try {
    page = await fetchPage(slug);
  } catch (e) {
    err = e instanceof Error ? e.message : "Error";
  }

  if (!err && !page) notFound();

  return (
    <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {err ? (
        <p className="text-sm text-red-800">{err}</p>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-slate-900">
            {page?.title}
          </h1>
          <div
            className="cms-content mt-4 text-sm leading-relaxed text-slate-800 [&_a]:text-blue-700 [&_h1]:text-xl [&_h2]:text-lg [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{
              __html: page?.contentHtml || "<p>No content.</p>",
            }}
          />
        </>
      )}
    </article>
  );
}
