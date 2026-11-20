import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-cue-green text-white hover:bg-cue-green-deep shadow-sm shadow-cue-green/25",
  secondary:
    "bg-white text-cue-navy border border-cue-line hover:border-cue-navy/40 hover:bg-cue-mist/60",
  ghost: "bg-transparent text-cue-navy hover:bg-cue-mist/80",
  danger: "bg-[#C2410C] text-white hover:bg-[#9A3412]",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cue-green disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
