"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Header() {
  const { user, token, logout } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Government Seal Bar */}
      <div className="border-b border-orange-200 bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-2 text-center">
        <p className="text-md text-white">
          Bihar State Mission Development Organization, Patna
        </p>
      </div>

      {/* Main Header */}
      <header className="border-b-4 border-orange-500 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            
            {/* Left: Logo & Title */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80"
            >
              <div className="relative h-12 w-12">
                <Image
                  src="/bihar-logo.png"
                  alt="Bihar Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="hidden sm:block">
                <h1 className="text-md font-bold text-blue-900">
                  Recruitment & Examination Portal
                </h1>
              </div>
            </Link>

            {/* Center */}
            <div className="hidden flex-1 justify-center md:flex">
              <p className="text-sm font-medium text-gray-700">
                Online Application System
              </p>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              {token && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.name}
                    </p>

                    <p className="text-xs text-blue-600">
                      {user.role === "SUPER_ADMIN"
                        ? "Super Admin"
                        : user.role}
                    </p>
                  </div>

                  <button
                    onClick={logout}
                    className="rounded bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded bg-blue-900 px-4 py-2 text-xs font-medium text-white hover:bg-blue-950"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-1 border-t border-gray-200 py-3 text-sm">
            <Link
              href="/"
              className="rounded px-3 py-2 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900"
            >
              Home
            </Link>

            <Link
              href="/recruitments"
              className="rounded px-3 py-2 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900"
            >
              Recruitments
            </Link>

            <Link
              href="/notices"
              className="rounded px-3 py-2 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900"
            >
              Notices
            </Link>

            <Link
              href="/results"
              className="rounded px-3 py-2 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900"
            >
              Results
            </Link>

            <Link
              href="/pages"
              className="rounded px-3 py-2 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900"
            >
              Information
            </Link>

            {token && (
              <Link
                href={isAdmin ? "/admin" : "/candidate"}
                className="rounded px-3 py-2 font-medium text-orange-600 hover:bg-orange-50"
              >
                {isAdmin ? "Admin Panel" : "My Applications"}
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}