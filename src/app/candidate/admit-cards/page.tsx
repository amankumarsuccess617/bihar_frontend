"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type AdmitCardItem = {
  applicationId: number;
  applicationNo: string;

  recruitment: {
    code: string;
    title: string;
  };

  post: {
    id: number;
    code: string;
    name: string;
  };

  admitCard: {
    id: number;
    rollNo: string;
    examCenter: string;
    examDate: string;
    shift: string;
    pdfUrl?: string | null;
    generatedAt: string;
  };
};

export default function CandidateAdmitCards() {

  const { token, ready } = useAuth();

  const router = useRouter();

  const [items, setItems] = useState<AdmitCardItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState("");

  useEffect(() => {

    if (!ready) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    loadCards();

  }, [ready, token]);

  async function loadCards() {

    try {

      setLoading(true);

      // FIXED ROUTE

      const data = await apiFetch<AdmitCardItem[]>(
        "/api/admit-cards/me",
        { token }
      );

      setItems(data);

    } catch (e) {

      setErr(
        e instanceof Error
          ? e.message
          : "Failed to load admit cards"
      );

    } finally {

      setLoading(false);

    }

  }

  if (!ready) return null;

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Candidate Portal
            </p>

<h1 className="mt-1 text-2xl font-bold text-gray-900">              Admit Cards
            </h1>

            <p className="mt-2 text-gray-600">
              Download your examination admit cards
            </p>

          </div>

          <Link
            href="/candidate"
            className="rounded-lg bg-blue-300 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-950"
          >
            Back Dashboard
          </Link>

        </div>

      </div>

      {/* ERROR */}

      {err && (
        <Alert type="error">
          {err}
        </Alert>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

          <p className="text-lg font-medium text-gray-700">
            Loading admit cards...
          </p>

        </div>

      ) : items.length === 0 ? (

        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">

          <h2 className="text-3xl font-bold text-gray-900">
            No Admit Cards Available
          </h2>

          <p className="mt-3 text-gray-600">
            Admit cards have not been generated yet.
          </p>

        </div>

      ) : (

        <div className="space-y-5">

          {items.map((item) => (

            <div
              key={item.admitCard.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >

              {/* TOP */}

              <div className="border-b border-gray-200 bg-blue-900 px-6 py-5 text-white">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-sm uppercase tracking-wide text-blue-200">
                      {item.recruitment.code}
                    </p>

<h2 className="mt-1 text-xl font-bold">                      {item.post.name}
                    </h2>

                    <p className="mt-2 text-blue-100">
                      {item.recruitment.title}
                    </p>

                  </div>

                  <div className="rounded-xl bg-white/10 px-5 py-4 backdrop-blur">

                    <p className="text-xs uppercase tracking-wide text-blue-200">
                      Roll Number
                    </p>

<p className="mt-1 font-mono text-lg font-bold break-all">                      {item.admitCard.rollNo}
                    </p>

                  </div>

                </div>

              </div>

              {/* BODY */}

              <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

                <InfoCard
                  title="Application No"
                  value={item.applicationNo}
                />

                <InfoCard
                  title="Exam Center"
                  value={item.admitCard.examCenter}
                />

                <InfoCard
                  title="Exam Date"
                  value={new Date(
                    item.admitCard.examDate
                  ).toLocaleDateString("en-IN")}
                />

                <InfoCard
                  title="Shift"
                  value={item.admitCard.shift}
                />

              </div>

              {/* ACTION */}

              <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-sm text-gray-600">
                      Generated on{" "}
                      {new Date(
                        item.admitCard.generatedAt
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  {item.admitCard.pdfUrl ? (

                    <a
                      href={`http://localhost:5000${item.admitCard.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800"
                    >
                      Download Admit Card PDF
                    </a>

                  ) : (

                    <button
                      disabled
                      className="rounded-lg bg-gray-300 px-6 py-3 text-sm font-semibold text-gray-600"
                    >
                      PDF Not Generated
                    </button>

                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

<p className="mt-1 text-base font-semibold text-gray-900 break-all">        {value}
      </p>

    </div>

  );

}