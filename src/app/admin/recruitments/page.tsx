"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Recruitment = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  isActive: boolean;
  posts?: Array<{ id: number; name: string }>;
};

export default function RecruitmentsAdmin() {
  const { token, ready, user } = useAuth();
  const router = useRouter();

  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const isAdmin =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!ready) return;

    if (!token || !isAdmin) {
      router.replace("/");
      return;
    }

    loadRecruitments();
  }, [ready, token, isAdmin, router]);

  async function loadRecruitments() {
    setLoading(true);

    try {
      const data = await apiFetch<Recruitment[]>(
        "/api/recruitments",
        { token }
      );

      setRecruitments(data || []);
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : "Failed to load recruitments"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setErr("");
    setMsg("");
    setBusy(true);

    try {
      const newRec = await apiFetch<Recruitment>(
        "/api/recruitments",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            code: code.trim(),
            title: title.trim(),
            description: description.trim(),
            startAt: startAt || null,
            endAt: endAt || null,
          }),
        }
      );

      setRecruitments((prev) => [newRec, ...prev]);

      setMsg("Recruitment created successfully!");

      setCode("");
      setTitle("");
      setDescription("");
      setStartAt("");
      setEndAt("");
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : "Failed to create recruitment"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleStatus(
    id: number,
    currentStatus: boolean
  ) {
    setErr("");
    setMsg("");

    try {
      const updated = await apiFetch<Recruitment>(
        `/api/recruitments/${id}/toggle`,
        {
          method: "PATCH",
          token,
        }
      );

      setRecruitments((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, isActive: updated.isActive }
            : r
        )
      );

      setMsg(
        `Recruitment ${updated.isActive ? "enabled" : "disabled"} successfully!`
      );
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : "Failed to update recruitment"
      );
    }
  }

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Recruitments
          </h1>

          <p className="mt-1 text-gray-600">
            Create and manage recruitment advertisements
          </p>
        </div>

        <Link
          href="/admin"
          className="font-medium text-blue-900 hover:text-blue-950"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Alerts */}
      {err && <Alert type="error">{err}</Alert>}
      {msg && <Alert type="success">{msg}</Alert>}

      {/* Create Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Create New Recruitment
        </h2>

        <form
          onSubmit={handleCreate}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Code */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Code
              </label>

              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., BPSC-2026-01"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Title
              </label>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Recruitment title"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Recruitment description"
              className="h-24 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Start Date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Start Date (Optional)
              </label>

              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                placeholder="e.g., 2026-05-24"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                End Date (Closing Date)
              </label>

              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                placeholder="e.g., 2026-06-24"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-blue-900 px-4 py-2 font-medium text-white hover:bg-blue-950 disabled:opacity-50"
          >
            {busy
              ? "Creating..."
              : "Create Recruitment"}
          </button>
        </form>
      </div>

      {/* Recruitment List */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            All Recruitments ({recruitments.length})
          </h2>
        </div>

        {loading ? (
          <p className="p-6 text-gray-600">
            Loading...
          </p>
        ) : recruitments.length === 0 ? (
          <p className="p-6 text-gray-600">
            No recruitments yet. Create one above to get
            started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Code
                  </th>

                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Title
                  </th>

                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Posts
                  </th>

                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {recruitments.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-gray-900">
                      {rec.code}
                    </td>

                    <td className="px-6 py-3 font-medium text-gray-900">
                      {rec.title}
                    </td>

                    <td className="px-6 py-3 text-gray-600">
                      {rec.posts?.length || 0}
                    </td>

                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          rec.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rec.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="flex gap-2 px-6 py-3">
                      <button className="text-sm font-medium text-blue-900 hover:text-blue-950">
                        Edit
                      </button>

                      <span className="text-gray-300">
                        •
                      </span>

                      <button
                        onClick={() => handleToggleStatus(rec.id, rec.isActive)}
                        className={`text-sm font-medium ${
                          rec.isActive
                            ? "text-orange-600 hover:text-orange-700"
                            : "text-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        {rec.isActive ? "Disable" : "Enable"}
                      </button>

                      <span className="text-gray-300">
                        •
                      </span>

                      <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}