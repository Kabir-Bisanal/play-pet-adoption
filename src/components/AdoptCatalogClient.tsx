"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PetProfile, SAMPLE_PETS } from "@/data/pets";
import PetCard from "./PetCard";
import PetModal from "./PetModal";

type FilterCategory = "all" | "dog" | "cat";

export default function AdoptCatalogClient() {
  const searchParams = useSearchParams();
  const initialSpecies = searchParams.get("species");

  const [filter, setFilter] = useState<FilterCategory>(
    initialSpecies === "dog" || initialSpecies === "cat"
      ? initialSpecies
      : "all"
  );
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);

  useEffect(() => {
    if (initialSpecies === "dog" || initialSpecies === "cat") {
      setFilter(initialSpecies);
    } else if (initialSpecies === null) {
      setFilter("all");
    }
  }, [initialSpecies]);

  const visiblePets =
    filter === "all"
      ? SAMPLE_PETS
      : SAMPLE_PETS.filter((pet) => pet.species === filter);

  const dogCount = SAMPLE_PETS.filter((p) => p.species === "dog").length;
  const catCount = SAMPLE_PETS.filter((p) => p.species === "cat").length;

  return (
    <>
      <div
        className="section-header"
        style={{ marginBottom: "28px", alignItems: "center" }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Showing <strong>{visiblePets.length}</strong> available rescue
          companions
        </p>

        <div
          className="filter-bar"
          role="tablist"
          aria-label="Filter adoptable pets"
        >
          <button
            type="button"
            className={`filter-btn${filter === "all" ? " active" : ""}`}
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All ({SAMPLE_PETS.length})
          </button>
          <button
            type="button"
            className={`filter-btn${filter === "dog" ? " active" : ""}`}
            role="tab"
            aria-selected={filter === "dog"}
            onClick={() => setFilter("dog")}
          >
            Dogs &amp; Puppies ({dogCount})
          </button>
          <button
            type="button"
            className={`filter-btn${filter === "cat" ? " active" : ""}`}
            role="tab"
            aria-selected={filter === "cat"}
            onClick={() => setFilter("cat")}
          >
            Cats &amp; Kittens ({catCount})
          </button>
        </div>
      </div>

      <div className="pet-grid">
        {visiblePets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onViewProfile={(chosen) => setSelectedPet(chosen)}
          />
        ))}
      </div>

      <PetModal pet={selectedPet} onClose={() => setSelectedPet(null)} />
    </>
  );
}
