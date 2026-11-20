"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-cue-radial"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-cue-green/15 blur-3xl"
        animate={{ y: [0, 18, 0], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-cue-navy/15 blur-3xl"
        animate={{ y: [0, -16, 0], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="mb-8"
        >
          <Image src="/logo.svg" alt="CueClose" width={280} height={220} priority />
        </motion.div>

        <motion.p
          className="max-w-md font-sans text-base leading-relaxed text-cue-slate"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          Ambient cues in. Approvals explicit. Ledgers exact. The tour keeps moving. The books keep
          up.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0.35 }}
          transition={{ duration: 0.4 }}
        >
          <Button onClick={onEnter} disabled={!ready} className="min-w-44">
            Enter tour close
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
