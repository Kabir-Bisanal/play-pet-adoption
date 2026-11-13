export type PetSpecies = "dog" | "cat" | "other";

/**
 * Generate a clean, URL-friendly slug from pet name.
 */
export function generateSlug(name: string): string {
  const clean = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "companion";
}

/**
 * Determine the next sequential adoption code based on species.
 * E.g., Dogs: #D01..#D99; Cats: #C01..#C99; Other: #O01..#O99.
 */
export async function getNextAdoptionCode(
  species: PetSpecies,
  supabaseClient?: any
): Promise<string> {
  const prefix = species === "dog" ? "#D" : species === "cat" ? "#C" : "#O";

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("pets")
        .select("adoption_code")
        .like("adoption_code", `${prefix}%`);

      if (!error && data && data.length > 0) {
        let maxNum = 0;
        for (const row of data) {
          const numPart = row.adoption_code.replace(prefix, "").trim();
          const parsed = parseInt(numPart, 10);
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed;
          }
        }
        const nextNum = maxNum + 1;
        return `${prefix}${nextNum < 10 ? "0" + nextNum : nextNum}`;
      }
    } catch (err) {
      console.warn("Notice: Code generation falling back to local counter:", err);
    }
  }

  // Fallback defaults: Dogs have #D01..#D09 (next is #D10), Cats have #C01..#C02 (next is #C03), Other starts at #O01
  const starterCounts: Record<string, number> = { dog: 9, cat: 2, other: 0 };
  const nextNum = (starterCounts[species] ?? 0) + 1;
  return `${prefix}${nextNum < 10 ? "0" + nextNum : nextNum}`;
}
