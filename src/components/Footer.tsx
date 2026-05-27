"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t-4 border-orange-500 bg-blue-900 text-white mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Portal</h3>
            <p className="text-sm text-blue-100">
              Official recruitment and examination management portal of Bihar State Mission Development Organization
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
  href="/recruitments"
  className="!text-blue-200 hover:!text-white"
>
  View Recruitments
</Link>
              </li>
              <li>
                <Link href="/notices" className="!text-blue-200 hover:!text-white">
                  Notices
                </Link>
              </li>
              <li>
                <Link href="/results" className="!text-blue-200 hover:!text-white">
                  Results
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="!text-blue-200 hover:!text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-bold mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pages/terms-and-conditions" className="!text-blue-200 hover:!text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy-policy" className="!text-blue-200 hover:!text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/pages/disclaimer" className="!text-blue-200 hover:!text-white">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-sm text-blue-100 mb-2">
              <strong>Email:</strong> help@recruitment.bihar.gov.in
            </p>
            <p className="text-sm text-blue-100">
              <strong>Helpline:</strong> 1800-XXX-XXXX
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-blue-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-blue-100">
          <p>© 2026 Bihar State Mission Development Organization. All rights reserved.</p>
          <p>Government of Bihar Official Portal</p>
        </div>
      </div>
    </footer>
  );
}
