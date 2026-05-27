"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { NotificationBell } from "./NotificationBell";

const link = "text-sm text-slate-700 hover:text-blue-800";

export function Navbar() {
  const { user, token, logout, ready } = useAuth();
  const isAdmin =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Recruitment Portal
        </Link>
        <nav className="flex flex-wrap items-center gap-4">
          <Link className={link} href="/notices">
            Notices
          </Link>
          <Link className={link} href="/recruitments">
            Recruitments
          </Link>
          <Link className={link} href="/results">
            Results
          </Link>
          <Link className={link} href="/pages">
            Pages
          </Link>
          {ready && token && (
            <>
              <Link className={link} href="/candidate">
                My applications
              </Link>
              <Link className={link} href="/candidate/results">
                My results
              </Link>
              {isAdmin && (
                <Link className={link} href="/admin">
                  Admin
                </Link>
              )}
            </>
          )}
          {ready && !token && (
            <>
              <Link className={link} href="/login">
                Login
              </Link>
              <Link
                className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                href="/register"
              >
                Register
              </Link>
            </>
          )}
          {ready && token && user && (
            <>
              <NotificationBell token={token} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {user.name} ({user.role})
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
