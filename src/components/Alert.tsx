export function Alert({
  type = "info",
  children,
}: {
  type?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const cls =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-slate-200 bg-slate-50 text-slate-800";
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>
      {children}
    </div>
  );
}
