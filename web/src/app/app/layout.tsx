"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DemoProvider, useDemo } from "@/components/demo/DemoProvider";

function Shell({ children }: { children: React.ReactNode }) {
  const { actor, edition, setEdition, reset } = useDemo();
  return (
    <AppShell
      actorName={actor?.name}
      edition={edition}
      onEditionChange={setEdition}
      onReset={() => void reset()}
    >
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <Shell>{children}</Shell>
    </DemoProvider>
  );
}
