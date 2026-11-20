"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type Actor, type Dashboard } from "@/lib/api";

type DemoContextValue = {
  dashboard: Dashboard | null;
  loading: boolean;
  error: string | null;
  actorId: string;
  actor: Actor | null;
  setActorId: (id: string) => void;
  refresh: () => Promise<void>;
  reset: () => Promise<void>;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actorId, setActorId] = useState("actor_maya");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.dashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    await api.reset();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const actor = useMemo(
    () => dashboard?.actors.find((item) => item.id === actorId) ?? null,
    [actorId, dashboard],
  );

  const value = useMemo(
    () => ({
      dashboard,
      loading,
      error,
      actorId,
      actor,
      setActorId,
      refresh,
      reset,
    }),
    [dashboard, loading, error, actorId, actor, refresh, reset],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
