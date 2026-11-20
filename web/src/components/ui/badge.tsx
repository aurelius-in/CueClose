import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  new: "bg-cue-mist text-cue-navy",
  in_review: "bg-[#E8EEF6] text-cue-navy",
  awaiting_approval: "bg-[#FFF4DE] text-[#8A5A00]",
  approved: "bg-[#D9F5E7] text-cue-green-deep",
  posted: "bg-cue-green text-white",
  reconciled: "bg-cue-navy text-white",
  held: "bg-[#FDE8E4] text-[#9F1239]",
  unexplained: "bg-[#FDE8E4] text-[#9F1239]",
  explained: "bg-[#E8EEF6] text-cue-navy",
  matched: "bg-[#D9F5E7] text-cue-green-deep",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("status-pill", tone[status] ?? "bg-cue-mist text-cue-slate")}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
