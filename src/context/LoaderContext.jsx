import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

export const LoaderContext = createContext(null);

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 320;
const ROUTE_LOADING_MS = 420;

export const LoaderProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const visibleSinceRef = useRef(0);
  const routeTimerRef = useRef(null);

  const isActive = pendingCount > 0 || routeLoading;

  const increment = useCallback(() => setPendingCount((count) => count + 1), []);
  const decrement = useCallback(() => setPendingCount((count) => Math.max(0, count - 1)), []);

  const trackPromise = useCallback(async (promiseFactory) => {
    increment();
    try {
      return await promiseFactory();
    } finally {
      decrement();
    }
  }, [decrement, increment]);

  const beginRouteLoad = useCallback(() => {
    setRouteLoading(true);
    clearTimeout(routeTimerRef.current);
    routeTimerRef.current = setTimeout(() => {
      setRouteLoading(false);
    }, ROUTE_LOADING_MS);
  }, []);

  const endRouteLoad = useCallback(() => {
    clearTimeout(routeTimerRef.current);
    setRouteLoading(false);
  }, []);

  useEffect(() => {
    if (isActive) {
      clearTimeout(hideTimerRef.current);

      if (!visible) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = setTimeout(() => {
          visibleSinceRef.current = Date.now();
          setVisible(true);
          setProgress((value) => (value > 12 ? value : 12));
        }, SHOW_DELAY_MS);
      }
      return;
    }

    clearTimeout(showTimerRef.current);

    if (!visible) {
      setProgress(0);
      return;
    }

    const elapsed = Date.now() - visibleSinceRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    hideTimerRef.current = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 180);
    }, remaining);
  }, [isActive, visible]);

  useEffect(() => {
    if (!visible) {
      clearInterval(progressTimerRef.current);
      return;
    }

    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setProgress((value) => {
        if (!isActive) return value;
        if (value >= 90) return value;
        const step = value < 35 ? 10 : value < 65 ? 6 : 2;
        return Math.min(90, value + step);
      });
    }, 160);

    return () => clearInterval(progressTimerRef.current);
  }, [visible, isActive]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(hideTimerRef.current);
      clearTimeout(routeTimerRef.current);
      clearInterval(progressTimerRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      pendingCount,
      routeLoading,
      visible,
      progress,
      isBusy: isActive,
      increment,
      decrement,
      trackPromise,
      beginRouteLoad,
      endRouteLoad
    }),
    [pendingCount, routeLoading, visible, progress, isActive]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};
