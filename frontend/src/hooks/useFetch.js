import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';

// Runs an async loader and tracks loading/error state. Re-runs when `deps` change.
export default function useFetch(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const requestId = useRef(0);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const result = await loaderRef.current();
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) setError(getErrorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);

  return { data, loading, error, reload: run, setData };
}
