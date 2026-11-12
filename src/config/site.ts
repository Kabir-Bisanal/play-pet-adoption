/**
 * Central Brand & Site Configuration
 * Update `SITE_CONFIG` in one place to change the brand name, tagline,
 * contact numbers, or placeholder email across the entire website.
 */
export const SITE_CONFIG = {
  brandName: "Haven Paws",
  brandTagline: "Adopt. Love. Belong.",
  brandSubtitle: "Animal Rescue & Adoption",
  regionLabel: "North Bangalore (Rajanukunte)",
  fullAddress: "Rajanukunte / Devanahalli, North Bangalore",
  whatsappNumber: "918630438778",
  displayPhone: "+91 86304 38778",
  contactEmail: "adoptions@havenpaws.org", // Sample placeholder until client provides official inbox
  description:
    "Meet adorable rescue dogs and cats ready for forever homes in North Bangalore. Browse verified profiles, learn their stories, and apply to adopt.",
} as const;

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
