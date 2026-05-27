"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type FormField = {
  name: string;
  label: string;
  type: string;
};

export default function AdminApplicationDetails() {

  const params = useParams();

  const id = Number(params.id);

  const { token } = useAuth();

  const [app, setApp] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const items = await apiFetch<any[]>(
        "/api/applications/admin",
        { token }
      );

      const found = items.find((x) => x.id === id);

      setApp(found);

    } finally {

      setLoading(false);

    }

  }

  if (loading) {

    return (

      <div className="flex h-[60vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-900"></div>

          <p className="text-sm text-gray-600">
            Loading application...
          </p>

        </div>

      </div>

    );

  }

  if (!app) {

    return (

      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">

        Application not found

      </div>

    );

  }

  return (

    <div className="mx-auto max-w-7xl space-y-6">

      {/* HEADER */}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">

              Candidate Application

            </div>

            <h1 className="text-3xl font-bold text-gray-900">

              {app.applicationNo}

            </h1>

            <p className="mt-2 text-sm text-gray-600">

              Bihar Recruitment Portal

            </p>

          </div>

          <Link
            href="/admin/applications"
            className="rounded-lg bg-blue-400 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-950"
          >
            ← Back
          </Link>

        </div>

      </div>

      {/* TOP SECTION */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT */}

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-4">

            <h2 className="text-lg font-bold text-gray-900">

              Candidate Information

            </h2>

          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">

            <InfoCard
              label="Candidate Name"
              value={app.user?.name}
            />

            <InfoCard
              label="Email Address"
              value={app.user?.email}
            />

            <InfoCard
              label="Password"
              value={app.user?.phone}
            />

            <InfoCard
              label="Application Status"
              value={app.status}
            />

            <InfoCard
              label="Recruitment"
              value={app.post?.recruitment?.title}
            />

            <InfoCard
              label="Post Name"
              value={app.post?.name}
            />

          </div>

        </div>

        {/* PAYMENT */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-4">

            <h2 className="text-lg font-bold text-gray-900">

              Payment Summary

            </h2>

          </div>

          <div className="space-y-4 p-6">

            {(app.payments || []).length > 0 ? (

              app.payments.map((p: any) => (

                <div
                  key={p.id}
                  className="rounded-xl border border-green-200 bg-green-50 p-5"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-medium text-gray-600">

                      Payment Status

                    </span>

                    <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">

                      {p.status}

                    </span>

                  </div>

                  <div className="mt-5">

                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">

                      Amount Paid

                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-900">

                      ₹{(p.amountPaise / 100).toFixed(2)}

                    </p>

                  </div>

                </div>

              ))

            ) : (

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">

                <p className="font-medium text-gray-700">

                  No Payment Found

                </p>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* FORM DETAILS */}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-4">

          <h2 className="text-lg font-bold text-gray-900">

            Candidate Submitted Form

          </h2>

          <p className="mt-1 text-sm text-gray-600">

            Complete form details submitted by candidate

          </p>

        </div>

        <div className="p-6">

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {(app.post?.formSchema?.fields || []).map(
              (field: FormField) => {

                const value = app.data?.[field.name];

                return (

                  <div
                    key={field.name}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >

                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">

                      {field.label}

                    </p>

                    {field.type === "file" && value ? (

                      <a
                        href={value}
                        target="_blank"
                        className="inline-flex rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950"
                      >
                        View Uploaded File
                      </a>

                    ) : (

                      <p className="break-words text-sm font-semibold text-gray-900">

                        {value || "-"}

                      </p>

                    )}

                  </div>

                );

              }
            )}

          </div>

        </div>

      </div>

    </div>

  );

}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: any;
}) {

  return (

    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">

        {label}

      </p>

      <p className="break-words text-base font-semibold text-gray-900">

        {value || "-"}

      </p>

    </div>

  );

}