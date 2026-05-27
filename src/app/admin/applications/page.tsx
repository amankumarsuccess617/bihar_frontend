"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Application = {
  id: number;
  applicationNo: string;
  status: string;

  user: {
    name: string;
    email: string;
    phone: string;
  };

  post: {
    name: string;

    recruitment: {
      title: string;
    };
  };

  payments?: {
    status: string;
    amountPaise: number;
  }[];
};

export default function AdminApplicationsPage() {

  const { token } = useAuth();

  const [items, setItems] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);

  async function loadData() {

    try {

      const data = await apiFetch<Application[]>(
        "/api/applications/admin",
        { token }
      );

      setItems(data);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadData();

  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-600">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-gray-900">
            Applications
          </h1>

          <p className="mt-1 text-gray-600">
            View all submitted candidate applications
          </p>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-blue-50">

              <tr className="border-b">

                <th className="px-6 py-4 text-sm font-bold text-gray-700">
                  Application No
                </th>

                <th className="px-6 py-4 text-sm font-bold text-gray-700">
                  Candidate
                </th>

                <th className="px-6 py-4 text-sm font-bold text-gray-700">
                  Recruitment
                </th>

                <th className="px-6 py-4 text-sm font-bold text-gray-700">
                  Post
                </th>

                <th className="px-6 py-4 text-sm font-bold text-gray-700">
                  Status
                </th>

                <th className="px-6 py-4 text-sm font-bold text-gray-700">
                  Payment
                </th>

                <th className="px-6 py-4 text-sm font-bold text-gray-700">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {items.map((app) => {

                const payment = app.payments?.[0];

                return (

                  <tr
                    key={app.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-5 font-mono text-sm">
                      {app.applicationNo}
                    </td>

                    <td className="px-6 py-5">

                      <div className="font-semibold text-gray-900">
                        {app.user?.name}
                      </div>

                      <div className="text-sm text-gray-600">
                        {app.user?.email}
                      </div>

                      <div className="text-sm text-gray-500">
                        {app.user?.phone}
                      </div>

                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {app.post?.recruitment?.title}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {app.post?.name}
                    </td>

                    <td className="px-6 py-5">

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {app.status}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      {payment ? (

                        <div>

                          <div className="font-semibold text-green-700">
                            {payment.status}
                          </div>

                          <div className="text-sm text-gray-600">
                            ₹{(payment.amountPaise / 100).toFixed(2)}
                          </div>

                        </div>

                      ) : (

                        <span className="text-gray-500">
                          NO PAYMENT
                        </span>

                      )}

                    </td>

                    <td className="px-6 py-5">

                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="rounded-lg bg-blue-400 px-4 py-2 text-sm font-medium text-white hover:bg-blue-150"
                      >
                        Details
                      </Link>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}