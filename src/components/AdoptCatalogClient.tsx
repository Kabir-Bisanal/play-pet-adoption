"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PetProfile, SAMPLE_PETS } from "@/data/pets";
import { buildWhatsAppUrl } from "@/config/site";
import PetCard from "./PetCard";
import PetModal from "./PetModal";

export type FilterCategory =
  | "all"
  | "dogs"
  | "puppies"
  | "cats"
  | "kittens"
  | "special-needs"
  | "senior"
  | "other";

interface FilterTabConfig {
  id: FilterCategory;
  label: string;
}

export const FILTER_TABS: FilterTabConfig[] = [
  { id: "all", label: "All" },
  { id: "dogs", label: "Dogs" },
  { id: "puppies", label: "Puppies" },
  { id: "cats", label: "Cats" },
  { id: "kittens", label: "Kittens" },
  { id: "special-needs", label: "Special-needs" },
  { id: "senior", label: "Senior" },
  { id: "other", label: "Other Animals" },
];

const normalize = (val: string | undefined | null) => (val || "").toLowerCase().trim();

export function isPuppy(pet: PetProfile): boolean {
  if (pet.species !== "dog") return false;
  const badge = normalize(pet.badgeLabel);
  const age = normalize(pet.age);
  const hasPuppyTag = pet.tags?.some((t) => normalize(t).includes("puppy")) ?? false;
  return badge === "puppy" || hasPuppyTag || age.includes("month");
}

export function isKitten(pet: PetProfile): boolean {
  if (pet.species !== "cat") return false;
  const badge = normalize(pet.badgeLabel);
  const age = normalize(pet.age);
  const hasKittenTag = pet.tags?.some((t) => normalize(t).includes("kitten")) ?? false;
  return badge === "kitten" || hasKittenTag || age.includes("month");
}

export function isSpecialNeeds(pet: PetProfile): boolean {
  if (pet.isSpecialNeeds === true) return true;
  return (
    pet.tags?.some((t) =>
      /special|disabled|three-legged|medical|blind/i.test(t)
    ) ?? false
  );
}

export function isSenior(pet: PetProfile): boolean {
  if (pet.isSenior === true) return true;
  if (pet.tags?.some((t) => /senior/i.test(t))) return true;
  const age = pet.age || "";
  const yearMatch = age.match(/(\d+)\s*(?:\+)?\s*year/i);
  if (yearMatch && parseInt(yearMatch[1], 10) >= 7) return true;
  return false;
}

export function isOtherAnimal(pet: PetProfile): boolean {
  return pet.species === "other" || !["dog", "cat"].includes(normalize(pet.species));
}

export function matchesCategory(pet: PetProfile, category: FilterCategory): boolean {
  switch (category) {
    case "all":
      return true;
    case "dogs":
      return pet.species === "dog";
    case "puppies":
      return isPuppy(pet);
    case "cats":
      return pet.species === "cat";
    case "kittens":
      return isKitten(pet);
    case "special-needs":
      return isSpecialNeeds(pet);
    case "senior":
      return isSenior(pet);
    case "other":
      return isOtherAnimal(pet);
    default:
      return true;
  }
}

export function matchesSearch(pet: PetProfile, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  // Name
  if (normalize(pet.name).includes(q)) return true;
  // Breed
  if (normalize(pet.breed).includes(q)) return true;
  // Color
  if (normalize(pet.color).includes(q)) return true;
  // Story
  if (normalize(pet.story).includes(q)) return true;
  // Adoption code (matches "#D01" or "D01")
  const code = normalize(pet.adoptionCode);
  const codeClean = code.replace(/^#/, "");
  const qClean = q.replace(/^#/, "");
  if (code.includes(q) || codeClean.includes(qClean)) return true;
  // Tags
  if (pet.tags?.some((tag) => normalize(tag).includes(q))) return true;

  return false;
}

export default function AdoptCatalogClient() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);

  // Synchronize with URL query parameters
  useEffect(() => {
    const speciesParam = searchParams.get("species");
    const filterParam = searchParams.get("filter") || searchParams.get("category");
    const qParam = searchParams.get("q") || searchParams.get("search");

    if (qParam) {
      setSearchQuery(qParam);
    }

    const rawFilter = (filterParam || speciesParam || "").toLowerCase();
    if (rawFilter === "dog" || rawFilter === "dogs") {
      setActiveFilter("dogs");
    } else if (rawFilter === "cat" || rawFilter === "cats") {
      setActiveFilter("cats");
    } else if (rawFilter === "puppy" || rawFilter === "puppies") {
      setActiveFilter("puppies");
    } else if (rawFilter === "kitten" || rawFilter === "kittens") {
      setActiveFilter("kittens");
    } else if (
      rawFilter === "special-needs" ||
      rawFilter === "special_needs" ||
      rawFilter === "special"
    ) {
      setActiveFilter("special-needs");
    } else if (rawFilter === "senior") {
      setActiveFilter("senior");
    } else if (rawFilter === "other") {
      setActiveFilter("other");
    } else if (rawFilter === "all") {
      setActiveFilter("all");
    }
  }, [searchParams]);

  // Compute live facet counts scoped to search query
  const tabCounts = useMemo(() => {
    const queryMatched = SAMPLE_PETS.filter((p) => matchesSearch(p, searchQuery));
    return {
      all: queryMatched.length,
      dogs: queryMatched.filter((p) => matchesCategory(p, "dogs")).length,
      puppies: queryMatched.filter((p) => matchesCategory(p, "puppies")).length,
      cats: queryMatched.filter((p) => matchesCategory(p, "cats")).length,
      kittens: queryMatched.filter((p) => matchesCategory(p, "kittens")).length,
      "special-needs": queryMatched.filter((p) => matchesCategory(p, "special-needs")).length,
      senior: queryMatched.filter((p) => matchesCategory(p, "senior")).length,
      other: queryMatched.filter((p) => matchesCategory(p, "other")).length,
    };
  }, [searchQuery]);

  // Visible filtered pets
  const visiblePets = useMemo(() => {
    return SAMPLE_PETS.filter(
      (pet) =>
        matchesCategory(pet, activeFilter) && matchesSearch(pet, searchQuery)
    );
  }, [activeFilter, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  const getActiveTabLabel = () => {
    const tab = FILTER_TABS.find((t) => t.id === activeFilter);
    return tab ? tab.label : "All";
  };

  return (
    <div className="adopt-catalog-container">
      {/* Real-Time Keyword Search Bar */}
      <div className="catalog-search-wrap" role="search" aria-label="Search adoptable pets">
        <div className="search-input-box">
          <span className="search-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, breed, or tag..."
            aria-label="Search adoptable pets"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search input"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Catalog Status Bar */}
      <div className="catalog-status-bar">
        <p className="catalog-status-text">
          Showing <strong>{visiblePets.length}</strong>{" "}
          {visiblePets.length === 1 ? "companion" : "companions"}
          {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ""}
        </p>
        {(searchQuery.trim() || activeFilter !== "all") && (
          <button
            type="button"
            className="catalog-status-reset"
            onClick={handleResetFilters}
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Extended 8-Tab Filter Bar */}
      <div className="filter-bar-wrap">
        <div
          className="filter-bar"
          role="tablist"
          aria-label="Filter adoptable companions by category"
        >
          {FILTER_TABS.map((tab) => {
            const count = tabCounts[tab.id];
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`filter-btn${isActive ? " active" : ""}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pet Grid or Informative Empty State */}
      {visiblePets.length > 0 ? (
        <div className="pet-grid">
          {visiblePets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onViewProfile={(chosen) => setSelectedPet(chosen)}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty-state" role="status" aria-live="polite">
          <div className="empty-state-icon" aria-hidden="true">
            🐾
          </div>
          <h3 className="empty-state-title">No Companions Found</h3>
          <p className="empty-state-desc">
            {searchQuery.trim() && activeFilter !== "all" ? (
              <>
                No rescue companions matching <strong>&ldquo;{searchQuery.trim()}&rdquo;</strong> were found in the{" "}
                <strong>{getActiveTabLabel()}</strong> category.
              </>
            ) : searchQuery.trim() ? (
              <>
                We couldn&rsquo;t find any companions matching{" "}
                <strong>&ldquo;{searchQuery.trim()}&rdquo;</strong>. Try checking your spelling or searching for another breed, tag, or coat color.
              </>
            ) : (
              <>
                There are currently no rescue companions listed under{" "}
                <strong>{getActiveTabLabel()}</strong>. Our shelter intake in North Bangalore updates frequently!
              </>
            )}
          </p>

          <div className="empty-state-actions">
            <button
              type="button"
              className="btn-empty-reset"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
            <a
              href={buildWhatsAppUrl(
                searchQuery.trim()
                  ? `Hi Haven Paws team, I was searching for "${searchQuery.trim()}" on your adoption website but couldn't find a matching rescue. Are there any upcoming pets matching this?`
                  : `Hi Haven Paws team, I'm looking to adopt a companion in the ${getActiveTabLabel()} category. Could you let me know about upcoming rescues?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-empty-wa"
            >
              <span>💬</span> Ask on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Quick Profile Modal */}
      <PetModal pet={selectedPet} onClose={() => setSelectedPet(null)} />
    </div>
  );
}
