"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Application = {
  id: number;
  rollNo: string;
  status: string;
  postId: number;
  createdAt: string;
  post: {
    code: string;
    name: string;
    recruitment: {
      code: string;
      title: string;
    };
  };
  payment?: {
    status: string;
  };
};

export default function CandidateApplications() {
  const { token, ready, user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) {
      if (ready && !token) router.replace("/login");
      return;
    }
    loadApplications();
  }, [ready, token, router]);

  async function loadApplications() {
    setLoading(true);
    try {
      const data = await apiFetch<Application[]>("/api/applications/my", { token });
      setApplications(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "SHORTLISTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatus = (payment?: any) => {
    if (!payment) return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
    switch (payment.status) {
      case "SUCCESS":
        return { text: "Paid", color: "bg-green-100 text-green-800" };
      case "FAILED":
        return { text: "Failed", color: "bg-red-100 text-red-800" };
      default:
        return { text: payment.status, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track your applications and payments</p>
        </div>
        <Link href="/candidate" className="text-blue-900 hover:text-blue-950 font-medium">
          ← Dashboard
        </Link>
      </div>

      {err && <Alert type="error">{err}</Alert>}

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No applications yet</p>
          <Link href="/recruitments" className="text-blue-900 hover:text-blue-950 font-medium">
            Explore Recruitments →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const paymentStatus = getPaymentStatus(app.payment);
            return (
              <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="grid md:grid-cols-4 gap-4 items-start">
                  {/* Left */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase">{app.post.recruitment.code}</div>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{app.post.name}</h3>
                    <p className="text-sm text-gray-600">{app.post.code}</p>
                  </div>

                  {/* Middle */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Roll No</div>
                    <p className="font-mono text-gray-900 mt-1">{app.rollNo}</p>
                    <div className="text-xs text-gray-600 mt-2">
                      Applied: {new Date(app.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Application Status</div>
                    <span className={`inline-block px-3 py-1 rounded font-semibold text-xs mt-1 ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Payment & Actions */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Payment Status</div>
                    <span className={`inline-block px-3 py-1 rounded font-semibold text-xs mt-1 ${paymentStatus.color}`}>
                      {paymentStatus.text}
                    </span>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/candidate/application/${app.id}`}
                        className="text-blue-900 hover:text-blue-950 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
