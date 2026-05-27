import Link from "next/link";
import { notFound } from "next/navigation";
import { apiBase } from "@/lib/api";

type Post = {
  id: number;
  code: string;
  name: string;
  vacancies: number;
  isActive?: boolean;
  feeRules?: Record<string, number> | null;
};

type RecruitmentStatus = {
  status:
    | "ACCEPTING"
    | "NOT_STARTED"
    | "EXPIRED"
    | "DISABLED"
    | "UNKNOWN";

  label: string;
  startDate?: string;
  endDate?: string;
};

type RecruitmentDetail = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  isExpired?: boolean;
  isActive?: boolean;
  posts: Post[];
  status?: RecruitmentStatus;
};

async function fetchRecruitment(
  code: string
): Promise<RecruitmentDetail | null> {
  const res = await fetch(
    `${apiBase()}/api/posts/by-recruitment/${encodeURIComponent(
      code
    )}`,
    {
      cache: "no-store",
    }
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(
      "Failed to load recruitment"
    );
  }

  return res.json();
}

function getStatusBadgeStyle(
  status?: string
) {
  const styles: Record<
    string,
    string
  > = {
    ACCEPTING:
      "bg-green-100 text-green-700 border-green-300",

    NOT_STARTED:
      "bg-yellow-100 text-yellow-700 border-yellow-300",

    EXPIRED:
      "bg-red-100 text-red-700 border-red-300",

    DISABLED:
      "bg-gray-100 text-gray-700 border-gray-300",

    UNKNOWN:
      "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    styles[status || "UNKNOWN"] ||
    styles.UNKNOWN
  );
}

export default async function RecruitmentPostsPage(
  props: {
    params: Promise<{
      code: string;
    }>;
  }
) {
  const { code } =
    await props.params;

  let r: RecruitmentDetail | null =
    null;

  let err = "";

  try {
    r = await fetchRecruitment(
      code
    );
  } catch (e) {
    err =
      e instanceof Error
        ? e.message
        : "Error";
  }

  if (!err && !r) {
    notFound();
  }

const activePosts =
  r?.posts?.filter(
    (p: any) =>
      p.isActive === true
  ) || [];

/*
  HIDE RECRUITMENT
  IF NO ACTIVE POSTS
*/

if (
  r &&
  activePosts.length === 0
) {
  notFound();
}

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link
          href="/recruitments"
          className="hover:text-blue-900"
        >
          Recruitments
        </Link>

        <span>/</span>

        <span>{code}</span>
      </div>

      {/* Header Banner */}

      {!err && r && (
        <div className="rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-2 text-sm font-semibold text-blue-100">
                {code}
              </p>

              <h1 className="mb-3 text-4xl font-bold">
                {r.title}
              </h1>

              {r.description && (
                <p className="text-lg text-blue-100">
                  {r.description}
                </p>
              )}
            </div>

            {r.status && (
              <span
                className={`whitespace-nowrap rounded border px-3 py-1 text-sm font-medium ${getStatusBadgeStyle(
                  r.status.status
                )}`}
              >
                {r.status.label}
              </span>
            )}
          </div>

          {r.endAt && (
            <p className="mt-4 text-sm text-blue-100">
              Application
              Deadline:{" "}
              {new Date(
                r.endAt
              ).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {err}
        </div>
      )}

      {/* Expired Notice */}

      {r && r.isExpired && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-900">
            ⏰ Application
            Period Closed
          </p>

          <p className="mt-1 text-sm text-red-800">
            The application
            deadline for this
            recruitment has
            passed. New
            applications are no
            longer accepted.
          </p>
        </div>
      )}

      {/* Posts Section */}

      {activePosts.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Available Posts (
            {activePosts.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activePosts.map(
              (p) => (
                <div
                  key={p.id}
                  className={`rounded-lg border bg-white p-6 shadow-sm transition ${
                    r?.isExpired
                      ? "border-gray-300 opacity-70"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-900">
                      {p.code}
                    </div>

                    <span className="text-sm font-bold text-orange-600">
                      {
                        p.vacancies
                      }{" "}
                      Vacancy(ies)
                    </span>
                  </div>

                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    {p.name}
                  </h3>

                  {p.feeRules &&
                    Object.keys(
                      p.feeRules
                    ).length > 0 && (
                      <div className="mb-4 rounded border border-gray-200 bg-gray-50 p-3">
                        <p className="mb-2 text-xs font-semibold text-gray-700">
                          Application
                          Fee:
                        </p>

                        <div className="space-y-1">
                          {Object.entries(
                            p.feeRules
                          ).map(
                            ([
                              category,
                              paise,
                            ]) => (
                              <div
                                key={
                                  category
                                }
                                className="flex justify-between text-sm text-gray-600"
                              >
                                <span>
                                  {
                                    category
                                  }
                                </span>

                                <span className="font-semibold">
                                  ₹{" "}
                                  {(
                                    paise /
                                    100
                                  ).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {r?.isExpired ? (
                    <button
                      disabled
                      className="block w-full cursor-not-allowed rounded bg-gray-300 px-4 py-2 text-center font-medium text-gray-600"
                    >
                      Applications
                      Closed
                    </button>
                  ) : (
                    <Link
                      href={`/candidate/apply/${p.id}`}
                      className="block w-full rounded bg-blue-900 px-4 py-2 text-center font-medium text-white transition hover:bg-blue-950"
                    >
                      Apply Now →
                    </Link>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {activePosts.length ===
        0 && !err && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            No active posts in
            this recruitment
          </p>
        </div>
      )}

      {/* Info Banner */}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>
            Important:
          </strong>{" "}
          After applying,
          you'll need to
          upload required
          documents, pay the
          application fee,
          and can download
          your admit card
          once generated. For
          any issues, please
          contact the
          helpline.
        </p>
      </div>
    </div>
  );
}