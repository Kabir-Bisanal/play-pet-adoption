import fs from "node:fs";
import path from "node:path";
import { SAMPLE_PETS } from "../../src/data/pets.ts";

export const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "dogs", label: "Dogs" },
  { id: "puppies", label: "Puppies" },
  { id: "cats", label: "Cats" },
  { id: "kittens", label: "Kittens" },
  { id: "special-needs", label: "Special-needs" },
  { id: "senior", label: "Senior" },
  { id: "other", label: "Other Animals" },
];

export const normalize = (val) => (val || "").toString().toLowerCase().trim();

export function isPuppy(pet) {
  if (pet.species !== "dog") return false;
  const badge = normalize(pet.badgeLabel);
  const age = normalize(pet.age);
  const hasPuppyTag = pet.tags?.some((t) => normalize(t).includes("puppy")) ?? false;
  return badge === "puppy" || hasPuppyTag || age.includes("month");
}

export function isKitten(pet) {
  if (pet.species !== "cat") return false;
  const badge = normalize(pet.badgeLabel);
  const age = normalize(pet.age);
  const hasKittenTag = pet.tags?.some((t) => normalize(t).includes("kitten")) ?? false;
  return badge === "kitten" || hasKittenTag || age.includes("month");
}

export function isSpecialNeeds(pet) {
  if (pet.isSpecialNeeds === true) return true;
  return (
    pet.tags?.some((t) =>
      /special|disabled|three-legged|medical|blind/i.test(t)
    ) ?? false
  );
}

export function isSenior(pet) {
  if (pet.isSenior === true) return true;
  if (pet.tags?.some((t) => /senior/i.test(t))) return true;
  const age = pet.age || "";
  const yearMatch = age.match(/(\d+)\s*(?:\+)?\s*year/i);
  if (yearMatch && parseInt(yearMatch[1], 10) >= 7) return true;
  return false;
}

export function isOtherAnimal(pet) {
  return pet.species === "other" || !["dog", "cat"].includes(normalize(pet.species));
}

export function matchesCategory(pet, category) {
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

export function matchesSearch(pet, query) {
  const q = normalize(query);
  if (!q) return true;

  // Search across name
  if (normalize(pet.name).includes(q)) return true;
  // Search across breed
  if (normalize(pet.breed).includes(q)) return true;
  // Search across color
  if (normalize(pet.color).includes(q)) return true;
  // Search across story
  if (normalize(pet.story).includes(q)) return true;
  // Search across adoptionCode (matches e.g. "#D01" or "D01")
  const code = normalize(pet.adoptionCode);
  const codeClean = code.replace(/^#/, "");
  const qClean = q.replace(/^#/, "");
  if (code.includes(q) || codeClean.includes(qClean)) return true;
  // Search across personality tags
  if (pet.tags?.some((tag) => normalize(tag).includes(q))) return true;

  return false;
}

export function computeTabCounts(pets, query = "") {
  const queryMatched = pets.filter((p) => matchesSearch(p, query));
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
}

export class CatalogHarness {
  constructor(pets = SAMPLE_PETS) {
    this.allPets = [...pets];
    this.searchQuery = "";
    this.activeFilter = "all";
  }

  setSearchQuery(q) {
    this.searchQuery = q || "";
    return this;
  }

  setFilter(category) {
    this.activeFilter = category || "all";
    return this;
  }

  clearSearch() {
    this.searchQuery = "";
    return this;
  }

  resetAll() {
    this.searchQuery = "";
    this.activeFilter = "all";
    return this;
  }

  getVisiblePets() {
    return this.allPets.filter(
      (pet) =>
        matchesCategory(pet, this.activeFilter) &&
        matchesSearch(pet, this.searchQuery)
    );
  }

  getCounts() {
    return computeTabCounts(this.allPets, this.searchQuery);
  }

  isEmpty() {
    return this.getVisiblePets().length === 0;
  }

  getEmptyStateInfo() {
    const empty = this.isEmpty();
    if (!empty) return null;

    const trimmed = this.searchQuery.trim();
    const tab = FILTER_TABS.find((t) => t.id === this.activeFilter);
    const tabLabel = tab ? tab.label : "All";

    return {
      isEmpty: true,
      query: trimmed,
      activeFilter: this.activeFilter,
      filterLabel: tabLabel,
      hasResetAction: true,
      hasWhatsAppAction: true,
    };
  }
}

export function inspectCatalogSource(filePath) {
  const targetPath = filePath || path.resolve(process.cwd(), "src/components/AdoptCatalogClient.tsx");
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Catalog component not found at: ${targetPath}`);
  }
  const content = fs.readFileSync(targetPath, "utf-8");

  return {
    path: targetPath,
    rawContent: content,
    hasUseClient: content.includes('"use client"') || content.includes("'use client'"),
    hasSearchInput: content.includes('className="search-input"') || content.includes("search-input"),
    hasSearchRole: content.includes('role="search"'),
    hasSearchClearBtn: content.includes("search-clear-btn") && content.includes("✕"),
    has8FilterTabs: FILTER_TABS.every((t) => content.includes(`"${t.id}"`) || content.includes(`'${t.id}'`)),
    hasTabRole: content.includes('role="tablist"') && content.includes('role="tab"'),
    hasFilterCounts: content.includes("filter-count") || content.includes("tabCounts"),
    hasEmptyState: content.includes("catalog-empty-state") || content.includes("empty-state"),
    hasEmptyResetBtn: content.includes("btn-empty-reset") || content.includes("Reset All Filters"),
    hasEmptyWhatsAppCta: content.includes("btn-empty-wa") || content.includes("buildWhatsAppUrl"),
  };
}
