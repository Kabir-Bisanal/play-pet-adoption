import { PetProfile, SAMPLE_PETS, getPetByIdOrCode } from "@/data/pets";
import { SAMPLE_SUCCESS_STORIES, SuccessStory } from "@/data/content";
import { getSupabaseServerClient } from "./supabase/server";
import { Database } from "./supabase/types";

type PetRow = Database["public"]["Tables"]["pets"]["Row"];
type StoryRow = Database["public"]["Tables"]["adoption_records"]["Row"];

export function mapDbPetToProfile(row: PetRow): PetProfile {
  return {
    id: row.slug,
    adoptionCode: row.adoption_code,
    name: row.name,
    species: row.species,
    badgeLabel: row.badge_label || "Available",
    breed: row.breed,
    age: row.age,
    gender: row.gender,
    size: row.size || "Medium",
    color: row.color || "Multi",
    image: row.image,
    gallery: Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : [row.image],
    alt: row.alt || `${row.name} - ${row.breed}`,
    tags: Array.isArray(row.tags) ? row.tags : [],
    vaccinationStatus: row.vaccination_status || "Vaccinated",
    dewormedStatus: row.dewormed_status || "Dewormed",
    sterilisationStatus: row.sterilisation_status || "Scheduled",
    medicalHistory: Array.isArray(row.medical_history) ? row.medical_history : [],
    adoptionRequirements: Array.isArray(row.adoption_requirements) ? row.adoption_requirements : [],
    location: row.location || "North Bangalore",
    story: row.story,
    whatsappMessage:
      row.whatsapp_message ||
      `Hi Haven Paws team, I fell in love with ${row.name} (${row.adoption_code}) on your adoption website! Can we schedule a visit to meet them?`,
    isSpecialNeeds: row.is_special_needs,
    isSenior: row.is_senior,
  };
}

export function mapDbStoryToSuccessStory(row: StoryRow): SuccessStory {
  return {
    id: row.id,
    petName: row.pet_name,
    speciesLabel: row.species_label,
    adopterNames: row.adopter_names,
    neighborhood: row.neighborhood,
    adoptedDate: row.adopted_date,
    image: row.image,
    beforeNote: row.before_note || "",
    afterQuote: row.after_quote,
  };
}

/**
 * Fetches all active pets from Supabase, falling back seamlessly
 * to SAMPLE_PETS when Supabase credentials are unset or the query fails.
 */
export async function getPets(): Promise<PetProfile[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return SAMPLE_PETS;
    }

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .in("status", ["available", "pending", "adopted"])
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return SAMPLE_PETS;
    }

    return data.map(mapDbPetToProfile);
  } catch (err) {
    console.warn("Notice: Falling back to SAMPLE_PETS due to DB error:", err);
    return SAMPLE_PETS;
  }
}

/**
 * Fetches a single pet by slug or code from Supabase, falling back
 * to local sample dataset.
 */
export async function getPetById(idOrCode: string): Promise<PetProfile | undefined> {
  const clean = (idOrCode || "").trim().toLowerCase();
  if (!clean) return undefined;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return getPetByIdOrCode(idOrCode);
    }

    // Attempt slug match first
    const { data: bySlug, error: slugErr } = await supabase
      .from("pets")
      .select("*")
      .eq("slug", clean)
      .maybeSingle();

    if (!slugErr && bySlug) {
      return mapDbPetToProfile(bySlug);
    }

    // Fallback to adoption_code match
    const normalizedCode = clean.startsWith("#") ? clean.toUpperCase() : `#${clean.toUpperCase()}`;
    const { data: byCode, error: codeErr } = await supabase
      .from("pets")
      .select("*")
      .eq("adoption_code", normalizedCode)
      .maybeSingle();

    if (!codeErr && byCode) {
      return mapDbPetToProfile(byCode);
    }

    return getPetByIdOrCode(idOrCode);
  } catch (err) {
    console.warn("Notice: Falling back to local pet lookup:", err);
    return getPetByIdOrCode(idOrCode);
  }
}

/**
 * Fetches all success stories from Supabase adoption_records,
 * falling back to SAMPLE_SUCCESS_STORIES.
 */
export async function getSuccessStories(): Promise<SuccessStory[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return SAMPLE_SUCCESS_STORIES;
    }

    const { data, error } = await supabase
      .from("adoption_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return SAMPLE_SUCCESS_STORIES;
    }

    return data.map(mapDbStoryToSuccessStory);
  } catch (err) {
    console.warn("Notice: Falling back to local stories:", err);
    return SAMPLE_SUCCESS_STORIES;
  }
}
