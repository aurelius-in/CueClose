export type DemoEdition = "baseline" | "pilot";

export const EDITION_COOKIE = "cueclose_edition";
export const EDITION_HEADER = "x-cueclose-edition";

export function parseEdition(value: string | null | undefined): DemoEdition {
  return value === "baseline" ? "baseline" : "pilot";
}

export function editionLabel(edition: DemoEdition) {
  return edition === "baseline" ? "Baseline (pre-Northline asks)" : "Northline pilot slice";
}
