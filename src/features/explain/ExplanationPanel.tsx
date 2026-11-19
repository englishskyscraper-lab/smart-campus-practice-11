import { Loader2, Sparkles } from "lucide-react";

interface ExplanationPanelProps {
  onExplain: () => void;
  loading: boolean;
  explanation: string | null;
  error: string | null;
}

export default function ExplanationPanel({
  onExplain,
  loading,
  explanation,
  error,
}: ExplanationPanelProps) {
  const showButton = !explanation && !error;

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-slate-700">
          Explain Availability
        </h3>
      </div>

      {showButton && (
        <button
          onClick={onExplain}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating explanation...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Explain Availability
            </>
          )}
        </button>
      )}

      {explanation && (
        <div>
          <p className="mb-1 text-xs font-medium text-slate-400">
            AI-generated explanation (mock)
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {explanation}
          </p>
        </div>
      )}

      {error && (
        <div>
          <p className="mb-1 text-xs font-medium text-amber-600">
            AI-generated explanation (mock) — fallback
          </p>
          <p className="text-sm leading-relaxed text-slate-600">{error}</p>
        </div>
      )}
    </section>
  );
}
