import Link from "next/link";
import { ResultSearch } from "./ResultSearch";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Results</h1>
        <p className="mt-1 text-sm text-slate-600">
          Public search and merit previews. Logged‑in candidates can also open{" "}
          <Link href="/candidate/results" className="text-blue-700 underline">
            my results
          </Link>
          .
        </p>
      </div>
      <ResultSearch />
    </div>
  );
}
