"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type Invoice = {
  id: number;
  invoiceNumber: string;
  gstInvoiceJson?: Record<string, unknown>;
  pdfUrl?: string;
  createdAt: string;
  payment?: {
    id: number;
    amount: number;
  };
};

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { token, ready } = useAuth();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!ready || !token) {
      if (ready && !token) router.replace("/login");
      return;
    }
  }, [ready, token, router]);

  useEffect(() => {
    if (!invoiceId || !token) return;
    (async () => {
      try {
        const data = await apiFetch<Invoice>(`/api/invoices/${invoiceId}`, { token });
        setInvoice(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    })();
  }, [invoiceId, token]);

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      const pdfBlob = await apiFetch<Blob>(`/api/invoices/${invoice.id}/pdf`, { token });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to download");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading invoice...</p>;
  }

  if (error || !invoice) {
    return <Alert type="error">{error || "Invoice not found"}</Alert>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/candidate" className="hover:text-blue-900">
          My Applications
        </Link>
        <span>/</span>
        <span>Invoice</span>
      </div>

      {/* Invoice Document */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-blue-100">Government of Bihar</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Invoice #</p>
              <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Invoice Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Invoice Date:</dt>
                  <dd className="font-medium">
                    {new Date(invoice.createdAt).toLocaleDateString("en-IN")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Amount:</dt>
                  <dd className="font-medium">
                    ₹ {((invoice.payment?.amount || 0) / 100).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Billing To</h3>
              <p className="text-sm text-gray-600">Candidate Application</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-gray-700">Application Fee</td>
                  <td className="px-4 py-3 text-right font-medium">
                    ₹ {((invoice.payment?.amount || 0) / 100).toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    ₹ {((invoice.payment?.amount || 0) / 100).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-xs text-gray-600">
            <p>
              This invoice is generated by the Government of Bihar Recruitment Portal.
              For any queries, please contact: <strong>recruitment@bihar.gov.in</strong>
            </p>
          </div>
        </div>

        {/* Download Button */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-4">
          <Link
            href="/candidate"
            className="flex-1 text-center px-4 py-2 border border-gray-300 rounded font-medium text-gray-900 hover:bg-gray-100"
          >
            Back
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded font-medium disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
