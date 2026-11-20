import { CueDetailClient } from "@/components/cues/CueDetailClient";

const KNOWN_CUES = ["cue_001", "cue_002", "cue_003", "cue_004", "cue_005"];

export function generateStaticParams() {
  return KNOWN_CUES.map((id) => ({ id }));
}

export default async function CueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CueDetailClient cueId={id} />;
}
