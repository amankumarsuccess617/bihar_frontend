"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/Alert";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const { login, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      if (u.role === "ADMIN" || u.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/candidate");
      }
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  if (!ready)
    return <p className="text-sm text-gray-600">Loading session…</p>;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-800">
              <span className="text-2xl font-bold text-white">भ</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Bihar Recruitment & Examination Portal
          </p>
        </div>

        {err && <Alert type="error">{err}</Alert>}

        {/* Form */}
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 py-2.5 text-sm font-medium text-white hover:from-blue-950 hover:to-blue-900 disabled:opacity-50 transition"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-900">
              Register here
            </Link>
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Admins use the same login with ADMIN role
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">Demo Credentials:</p>
        <p className="mt-1 text-xs font-mono">
          Email: admin@example.com | Password: admin123
        </p>
      </div>
    </div>
  );
}
