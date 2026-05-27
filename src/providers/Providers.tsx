"use client";

import { AuthProvider } from "./AuthProvider";
import { ToastProvider, ToastContainer } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}
