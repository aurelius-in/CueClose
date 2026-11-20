"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
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
  const [actorId, setActorIdState] = useState("actor_maya");
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.dashboard();
      setDashboard(data);
      if (data.active_actor_id) {
        setActorIdState(data.active_actor_id);
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(text.includes("fetch") ? "API unavailable" : text);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    await api.reset();
    await refresh();
  }, [refresh]);

  const setActorId = useCallback(
    (id: string) => {
      setActorIdState(id);
      startTransition(() => {
        void (async () => {
          try {
            const result = await api.setActor(id);
            setActorIdState(result.actor.id);
            await refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to switch actor");
            await refresh();
          }
        })();
      });
    },
    [refresh],
  );

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
    [dashboard, loading, error, actorId, actor, setActorId, refresh, reset],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
