"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="p-8 sm:p-12">
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold">
            Bihar Recruitment & Examination Portal
          </h1>
          <p className="mb-6 text-lg text-blue-100">
            Apply online for government posts, pay fees securely, download admit cards, and view results all in one place
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/recruitments"
              className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition"
            >
              View All Recruitments
            </Link>
            <Link
              href="/register"
              className="rounded-lg border-2 border-white bg-transparent px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              New Registration
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-orange-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="text-3xl font-bold text-blue-900">5+</div>
          <p className="mt-2 text-sm text-gray-600">Active Recruitments</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="text-3xl font-bold text-blue-900">50+</div>
          <p className="mt-2 text-sm text-gray-600">Available Posts</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="text-3xl font-bold text-blue-900">10K+</div>
          <p className="mt-2 text-sm text-gray-600">Applications</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="text-3xl font-bold text-blue-900">100%</div>
          <p className="mt-2 text-sm text-gray-600">Secure & Safe</p>
        </div>
      </div>

      {/* Main Features */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <Link
            href="/recruitments"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-500 hover:shadow-lg transition"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
              Browse Recruitments
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              View all active recruitment drives with detailed post information
            </p>
          </Link>

          {/* Feature 2 */}
          <Link
            href="/notices"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-500 hover:shadow-lg transition"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-2xl">📢</span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
              Official Notices
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Stay updated with important announcements and deadlines
            </p>
          </Link>

          {/* Feature 3 */}
          <Link
            href="/results"
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-500 hover:shadow-lg transition"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
              Check Results
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Search results by roll number or view merit lists
            </p>
          </Link>

          {/* Feature 4 */}
          <div className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-500 hover:shadow-lg transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-2xl">🔐</span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
              Secure Authentication
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              OTP verification and SSL encryption for data security
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-500 hover:shadow-lg transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
              Online Payment
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Secure payment gateway with multiple payment options
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-500 hover:shadow-lg transition">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
              Admit Cards
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Download and print admit cards directly from portal
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="rounded-lg bg-orange-50 border-2 border-orange-200 p-8 text-center">
        <h2 className="mb-3 text-2xl font-bold text-gray-900">Get Started Today</h2>
        <p className="mb-6 text-gray-700">
          Don't have an account? Register now to apply for positions
        </p>
        <Link
          href="/register"
          className="inline-block rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600 transition"
        >
          Start Registration
        </Link>
      </div>

      {/* Important Links */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-4 font-bold text-gray-900">Important Information</h3>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            <Link href="/pages/eligibility" className="text-blue-600 hover:text-blue-900">
              Eligibility Criteria
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            <Link href="/pages/how-to-apply" className="text-blue-600 hover:text-blue-900">
              How to Apply
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            <Link href="/pages/fee-structure" className="text-blue-600 hover:text-blue-900">
              Fee Structure
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            <Link href="/pages/selection-process" className="text-blue-600 hover:text-blue-900">
              Selection Process
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
