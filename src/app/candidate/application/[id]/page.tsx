"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { apiFetch, apiBase } from "@/lib/api";
import { openRazorpay } from "@/lib/razorpayCheckout";
import { uploadsUrl } from "@/lib/urls";
import { Alert } from "@/components/Alert";
import { useAuth } from "@/providers/AuthProvider";

type Payment = {
  id: number;
  status: string;
  amountPaise: number;
};

type FormField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
};

type ApplicationDetail = {
  id: number;
  applicationNo: string;
  status: string;
  data: Record<string, any>;
  documents: any[];

  post: {
    id: number;
    code: string;
    name: string;

    formSchema?: {
      fields: FormField[];
    };

    recruitment: {
      code: string;
      title: string;
    };
  };

  payments: Payment[];
  admitCard?: any;
  result?: any;
};

export default function ApplicationDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id: idRaw } = use(props.params);

  const id = Number(idRaw);

  const { token, ready } = useAuth();

  const router = useRouter();

  const [app, setApp] = useState<ApplicationDetail | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});

  const [err, setErr] = useState("");

  const [msg, setMsg] = useState("");

  const [busy, setBusy] = useState(false);

  const [fileUploading, setFileUploading] = useState(false);

  async function reload() {
    if (!token) return;

    const row = await apiFetch<ApplicationDetail[]>(
      "/api/applications/me",
      {
        token,
      }
    );

    const found = row.find((x) => x.id === id);

    if (!found) throw new Error("Application not found");

    setApp(found);

    setFormData(found.data || {});
  }

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    let c = false;

    (async () => {
      try {
        const row = await apiFetch<ApplicationDetail[]>(
          "/api/applications/me",
          {
            token,
          }
        );

        const found = row.find((x) => x.id === id);

        if (!found) throw new Error("Application not found");

        if (!c) {
          setApp(found);

          setFormData(found.data || {});
        }
      } catch (e) {
        if (!c) {
          setErr(e instanceof Error ? e.message : "Load failed");
        }
      }
    })();

    return () => {
      c = true;
    };
  }, [ready, token, router, id]);

  const editable = useMemo(() => {
    if (!app) return false;

    return [
      "DRAFT",
      "SUBMITTED",
      "PAYMENT_PENDING",
      "PAYMENT_FAILED",
    ].includes(app.status);
  }, [app]);

  async function saveData() {
    if (!token || !app) return;

    setBusy(true);

    setErr("");

    setMsg("");

    try {
      await apiFetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          data: formData,
        }),
      });

      setMsg("Application saved");

      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) {
    const file = e.target.files?.[0];

    if (!file || !token || !app) return;

    setFileUploading(true);

    try {
      const fd = new FormData();

      fd.append("file", file);

      fd.append("type", fieldName);

      const res = await fetch(
        `${apiBase()}/api/uploads/application/${app.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      const url = data.url;

      const updated = {
        ...formData,
        [fieldName]: url,
      };

      setFormData(updated);

      await apiFetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          data: updated,
        }),
      });

      await reload();

      setMsg(`${fieldName} uploaded`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setFileUploading(false);
    }
  }

  async function payNow() {
    if (!token || !app) return;

    setBusy(true);

    setErr("");

    try {
      const order = await apiFetch<any>(
        "/api/payments/create-order",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            applicationId: app.id,
          }),
        }
      );

      await openRazorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Recruitment Fee",
        description: app.applicationNo,
        order_id: order.orderId,

        handler: async (resp) => {
          try {
            await apiFetch("/api/payments/verify", {
              method: "POST",
              token,
              body: JSON.stringify({
                applicationId: app.id,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });

            await reload();

            setMsg("Payment successful");
          } catch (e) {
            setErr(
              e instanceof Error
                ? e.message
                : "Payment verification failed"
            );
          }
        },
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !token) return null;

  if (!app) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6">

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <p className="text-xs uppercase text-blue-700">
          {app.post.recruitment.code}
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          {app.post.name}
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Application No: {app.applicationNo}
        </p>

        <p className="mt-1 text-sm font-medium">
          Status: {app.status}
        </p>

      </div>

      {err && <Alert type="error">{err}</Alert>}

      {msg && <Alert type="success">{msg}</Alert>}

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-lg font-semibold">
          Candidate Details
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          {(app.post.formSchema?.fields || []).map((field) => {

            const value = formData[field.name] || "";

            // TEXT
            if (field.type === "text") {
              return (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-medium">
                    {field.label}
                  </label>

                  <input
                    type="text"
                    disabled={!editable}
                    value={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field.name]: e.target.value,
                      })
                    }
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
              );
            }

            // NUMBER
            if (field.type === "number") {
              return (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-medium">
                    {field.label}
                  </label>

                  <input
                    type="number"
                    disabled={!editable}
                    value={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field.name]: e.target.value,
                      })
                    }
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
              );
            }

            // DATE
            if (field.type === "date") {
              return (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-medium">
                    {field.label}
                  </label>

                  <input
                    type="date"
                    disabled={!editable}
                    value={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field.name]: e.target.value,
                      })
                    }
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
              );
            }

            // SELECT
            if (field.type === "select") {
              return (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-medium">
                    {field.label}
                  </label>

                  <select
                    disabled={!editable}
                    value={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field.name]: e.target.value,
                      })
                    }
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="">Select</option>

                    {(field.options || []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // FILE
            if (field.type === "file") {
              return (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-medium">
                    {field.label}
                  </label>

                  <input
                    type="file"
                    disabled={!editable || fileUploading}
                    onChange={(e) => uploadFile(e, field.name)}
                    className="w-full rounded-md border px-3 py-2"
                  />

                  {value && (
                    <a
                      href={uploadsUrl(value)}
                      target="_blank"
                      className="mt-2 inline-block text-sm text-blue-700 underline"
                    >
                      View Uploaded File
                    </a>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">

          <button
            onClick={() => saveData()}
            disabled={busy || !editable}
            className="rounded-md bg-blue-700 px-5 py-2 text-white"
          >
            Save Application
          </button>

          <button
            onClick={() => payNow()}
            disabled={
              busy ||
              !["DRAFT", "SUBMITTED", "PAYMENT_FAILED"].includes(app.status)
            }
            className="rounded-md bg-emerald-700 px-5 py-2 text-white"
          >
            Pay Application Fee
          </button>

        </div>

      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold">
          Payment History
        </h2>

        <div className="mt-4 space-y-2">

          {(app.payments || []).map((p) => (
            <div
              key={p.id}
              className="rounded-md border p-3 text-sm"
            >
              #{p.id} · {p.status} · ₹
              {(p.amountPaise / 100).toFixed(2)}
            </div>
          ))}

        </div>

      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold">
          Admit Card
        </h2>

        {!app.admitCard && (
          <p className="mt-2 text-sm text-slate-600">
            Admit card not generated yet.
          </p>
        )}

        {app.admitCard && (
          <div className="mt-4 space-y-2 text-sm">

            <div>
              Roll No: {app.admitCard.rollNo}
            </div>

            <div>
              Center: {app.admitCard.examCenter}
            </div>

            <div>
              Shift: {app.admitCard.shift}
            </div>

            {app.admitCard.pdfUrl && (
              <a
                href={uploadsUrl(app.admitCard.pdfUrl)}
                target="_blank"
                className="text-blue-700 underline"
              >
                Download Admit Card
              </a>
            )}
          </div>
        )}

      </section>

      <div>
        <Link
          href="/candidate"
          className="text-blue-700 underline"
        >
          ← Back
        </Link>
      </div>

    </div>
  );
}