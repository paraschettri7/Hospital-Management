import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "../api/client";

// Runs an async fetcher on mount (and whenever deps change), exposing
// { data, error, loading, refetch } so pages don't repeat the same boilerplate.
export function useAsync(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const run = useCallback(() => {
    setLoading(true);
    setError("");
    fetcher()
      .then(setData)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, error, loading, refetch: run };
}
