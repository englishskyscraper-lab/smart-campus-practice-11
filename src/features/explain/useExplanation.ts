import { useCallback, useRef, useState } from "react";
import { generateExplanation, MOCK_DELAY_MS } from "./mockAdapter";
import type { ExplainInput } from "./types";

const DEFAULT_TIMEOUT_MS = MOCK_DELAY_MS * 2; // 600 ms by default

interface UseExplanationReturn {
  explanation: string | null;
  loading: boolean;
  error: string | null;
  generate: (input: ExplainInput, timeoutMs?: number) => Promise<void>;
  clear: () => void;
}

export function useExplanation(): UseExplanationReturn {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const clear = useCallback(() => {
    requestIdRef.current += 1;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    loadingRef.current = false;
    setExplanation(null);
    setLoading(false);
    setError(null);
  }, []);

  const generate = useCallback(
    async (input: ExplainInput, timeoutMs: number = DEFAULT_TIMEOUT_MS) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const requestId = (requestIdRef.current += 1);
      const isCurrent = () => requestIdRef.current === requestId;

      const adapterPromise = generateExplanation(input).then((output) => {
        // Only clear the timer if it still belongs to this request.
        if (isCurrent() && timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return output;
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timerRef.current = setTimeout(() => {
          reject(new Error("timeout"));
        }, timeoutMs);
      });

      try {
        const output = await Promise.race([adapterPromise, timeoutPromise]);
        if (isCurrent()) {
          setExplanation(output.explanation);
        }
      } catch {
        if (isCurrent()) {
          setError(input.deterministicReason);
        }
      } finally {
        if (isCurrent()) {
          loadingRef.current = false;
          setLoading(false);
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    },
    []
  );

  return { explanation, loading, error, generate, clear };
}
