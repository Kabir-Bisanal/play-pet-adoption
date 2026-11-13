import { getSupabaseServerClient } from "./supabase/server";
import { SAMPLE_PETS } from "@/data/pets";
import { SAMPLE_SUCCESS_STORIES } from "@/data/content";

export interface DashboardStats {
  totalPets: number;
  availablePets: number;
  totalApplications: number;
  newApplications: number;
  adoptedCount: number;
}

export interface DashboardApplicationSummary {
  id: string;
  petName: string;
  petCode: string;
  applicantName: string;
  applicantPhone: string;
  city: string;
  status: string;
  createdAt: string;
}

export interface DashboardPetSummary {
  id: string;
  slug: string;
  name: string;
  adoptionCode: string;
  species: string;
  breed: string;
  status: string;
  image: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentApplications: DashboardApplicationSummary[];
  recentPets: DashboardPetSummary[];
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return getFallbackDashboardData();
    }

    // Parallel fetch for speed
    const [petsRes, recentAppsRes, totalAppsRes, recordsRes] = await Promise.all([
      supabase
        .from("pets")
        .select("id, slug, name, adoption_code, species, breed, status, image, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("adoption_applications")
        .select("id, pet_name, pet_code, applicant_name, applicant_phone, city, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("adoption_applications")
        .select("status", { count: "exact" }),
      supabase
        .from("adoption_records")
        .select("id", { count: "exact", head: true }),
    ]);

    const pets = petsRes.data || [];
    const recentApps = recentAppsRes.data || [];
    const allAppsData = totalAppsRes.data || [];
    const recordsCount = recordsRes.count || 0;

    const totalPets = pets.length;
    const availablePets = pets.filter((p) => p.status === "available").length;
    const adoptedPetsCount = pets.filter((p) => p.status === "adopted").length + recordsCount;

    const totalApplications = totalAppsRes.count ?? allAppsData.length;
    const newApplications = allAppsData.filter((a) => a.status === "new").length;

    const recentPets: DashboardPetSummary[] = pets.slice(0, 5).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      adoptionCode: p.adoption_code,
      species: p.species,
      breed: p.breed,
      status: p.status,
      image: p.image,
    }));

    const recentApplications: DashboardApplicationSummary[] = recentApps.map((a) => ({
      id: a.id,
      petName: a.pet_name,
      petCode: a.pet_code,
      applicantName: a.applicant_name,
      applicantPhone: a.applicant_phone,
      city: a.city,
      status: a.status,
      createdAt: a.created_at,
    }));

    return {
      stats: {
        totalPets: totalPets || SAMPLE_PETS.length,
        availablePets: availablePets || SAMPLE_PETS.length,
        totalApplications,
        newApplications,
        adoptedCount: adoptedPetsCount || SAMPLE_SUCCESS_STORIES.length,
      },
      recentApplications,
      recentPets,
    };
  } catch (error) {
    console.warn("Notice: Falling back to local dashboard stats:", error);
    return getFallbackDashboardData();
  }
}

function getFallbackDashboardData(): DashboardData {
  return {
    stats: {
      totalPets: SAMPLE_PETS.length,
      availablePets: SAMPLE_PETS.length,
      totalApplications: 0,
      newApplications: 0,
      adoptedCount: SAMPLE_SUCCESS_STORIES.length,
    },
    recentApplications: [],
    recentPets: SAMPLE_PETS.slice(0, 5).map((p) => ({
      id: p.id,
      slug: p.id,
      name: p.name,
      adoptionCode: p.adoptionCode,
      species: p.species,
      breed: p.breed,
      status: "available",
      image: p.image,
    })),
  };
}
