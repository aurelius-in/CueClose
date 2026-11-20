import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="CueClose"
      width={80}
      height={74}
      className={cn("h-10 w-auto", className)}
      priority
    />
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      <div className="leading-none">
        <div className="font-display text-2xl font-bold tracking-tight">
          <span className="text-cue-green">Cue</span>
          <span className="text-cue-navy">Close</span>
        </div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cue-slate">
          Tour finance that keeps up
        </div>
      </div>
    </div>
  );
}
