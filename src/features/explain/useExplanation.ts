import { useCallback, useRef, useState } from "react";
import { generateExplanation } from "./mockAdapter";
import type { ExplainInput } from "./types";

interface UseExplanationReturn {
  explanation: string | null;
  loading: boolean;
  error: string | null;
  generate: (input: ExplainInput) => Promise<void>;
  clear: () => void;
}

export function useExplanation(): UseExplanationReturn {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const clear = useCallback(() => {
    loadingRef.current = false;
    setExplanation(null);
    setLoading(false);
    setError(null);
  }, []);

  const generate = useCallback(async (input: ExplainInput) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const output = await generateExplanation(input);
      setExplanation(output.explanation);
    } catch {
      setError(input.deterministicReason);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  return { explanation, loading, error, generate, clear };
}
