"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCaptchaToken, recaptchaSiteKey } from "@/lib/captcha";
import { Alert } from "@/components/Alert";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [devHint, setDevHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const siteKeyConfigured = Boolean(recaptchaSiteKey());

  async function sendOtp() {
    setErr("");
    setDevHint("");
    setBusy(true);
    try {
      const captchaToken = await getCaptchaToken("register_send_otp");
      if (!captchaToken)
        throw new Error(
          "Captcha not configured: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in frontend/.env"
        );

      type OtpSend = {
        devCode?: string;
        expiresAt?: string;
      };
      const res = await apiFetch<OtpSend>("/api/otp/send", {
        method: "POST",
        body: JSON.stringify({
          channel: "EMAIL",
          destination: email.trim(),
          purpose: "REGISTER",
          captchaToken,
        }),
      });
      if (res.devCode) {
        setDevHint(
          `Dev OTP returned by API: ${res.devCode} (disable via backend OTP_DEV_RETURN_CODE)`
        );
      }
      setOkMsg("OTP sent to email (if gateway configured). Check server logs in dev.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "OTP send failed");
    } finally {
      setBusy(false);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    setBusy(true);
    try {
      const captchaToken = await getCaptchaToken("register_submit");
      if (!captchaToken)
        throw new Error(
          "Captcha not configured: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in frontend/.env"
        );

      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          password,
          otpChannel: "EMAIL",
          otpDestination: email.trim(),
          otpCode: otpCode.trim(),
          captchaToken,
        }),
      });
      setOkMsg("Registration successful. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Register failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          New candidate registration
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          OTP + captcha are required by the API. Use the same email for OTP
          destination.
        </p>
        {!siteKeyConfigured && (
          <div className="mt-3">
            <Alert type="error">
              Add{" "}
              <code className="rounded bg-white/60 px-1">
                NEXT_PUBLIC_RECAPTCHA_SITE_KEY
              </code>{" "}
              to <code className="rounded bg-white/60 px-1">frontend/.env</code>{" "}
              and restart Next.js.
            </Alert>
          </div>
        )}
      </div>
      {err && <Alert type="error">{err}</Alert>}
      {okMsg && <Alert type="success">{okMsg}</Alert>}
      {devHint && <Alert type="info">{devHint}</Alert>}

      <form className="space-y-3" onSubmit={register}>
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email (OTP destination)
          <input
            type="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phone (optional)
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap items-end gap-2">
          <label className="block min-w-[140px] flex-1 text-sm font-medium text-slate-700">
            Email OTP
            <input
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => void sendOtp()}
            disabled={busy || !email.trim()}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Send OTP
          </button>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-blue-700 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {busy ? "Please wait…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="text-blue-700 underline">
          Login
        </Link>
      </p>
    </div>
  );
}
