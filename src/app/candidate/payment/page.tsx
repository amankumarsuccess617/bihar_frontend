"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type PaymentData = {
  id: number;
  applicationId: number;
  amount: number;
  status: string;
  razorpayOrderId?: string;
  invoice?: { id: number };
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, ready } = useAuth();
  
  const appId = searchParams.get("appId");
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [ready, token, router]);

  useEffect(() => {
    if (!appId || !token) return;
    (async () => {
      try {
        const data = await apiFetch(`/api/payments/application/${appId}`, { token });
        setPayment(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load payment");
      } finally {
        setLoading(false);
      }
    })();
  }, [appId, token]);

  const handlePayment = async () => {
    if (!payment) return;
    setProcessing(true);
    setError("");
    try {
      // Initiate Razorpay payment
      await apiFetch(`/api/payments/${payment.id}/initiate`, {
        method: "POST",
        token,
        body: JSON.stringify({}),
      });
      setError("Redirecting to payment gateway...");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading payment details...</p>;
  }

  if (error && !processing) {
    return <Alert type="error">{error}</Alert>;
  }

  if (!payment) {
    return <Alert type="error">Payment not found</Alert>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/candidate" className="hover:text-blue-900">
          My Applications
        </Link>
        <span>/</span>
        <span>Payment</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold">Payment</h1>
        <p className="text-blue-100 mt-2">
          Application #{payment.applicationId}
        </p>
      </div>

      {/* Payment Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
        {/* Amount Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Amount Due</p>
          <div className="text-4xl font-bold text-green-700">
            ₹ {(payment.amount / 100).toFixed(2)}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Plus applicable taxes as per government guidelines
          </p>
        </div>

        {/* Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Payment Status</p>
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
              payment.status === "COMPLETED"
                ? "bg-green-100 text-green-800"
                : payment.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {payment.status}
            </span>
            {payment.status === "COMPLETED" && payment.invoice && (
              <Link
                href={`/candidate/invoice/${payment.invoice.id}`}
                className="text-sm text-blue-900 hover:text-blue-950 font-medium ml-auto"
              >
                View Invoice →
              </Link>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        {payment.status !== "COMPLETED" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Payment Method</h3>
            
            {/* Razorpay */}
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Razorpay Payment Gateway</p>
                  <p className="text-sm text-gray-600">Credit/Debit Card, UPI, Net Banking</p>
                </div>
                <div className="text-2xl">💳</div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Bank Transfer</p>
                  <p className="text-sm text-gray-600">Direct bank account transfer</p>
                </div>
                <div className="text-2xl">🏦</div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <Link
            href="/candidate"
            className="flex-1 text-center px-4 py-3 border border-gray-300 rounded font-medium text-gray-900 hover:bg-gray-50 transition"
          >
            Back
          </Link>
          {payment.status !== "COMPLETED" && (
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Important:</strong> Your payment must be completed to proceed with the application. You will receive a confirmation email once payment is successful.
        </p>
      </div>
    </div>
  );
}
