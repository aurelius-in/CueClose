export type DemoEdition = "classic" | "pro";

export const EDITION_COOKIE = "cueclose_edition";
export const EDITION_HEADER = "x-cueclose-edition";

export function parseEdition(value: string | null | undefined): DemoEdition {
  if (value === "classic" || value === "baseline") return "classic";
  return "pro";
}

export function editionLabel(edition: DemoEdition) {
  return edition === "classic" ? "Classic" : "Pro";
}
