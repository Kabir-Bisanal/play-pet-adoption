import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";

import { SAMPLE_PETS } from "../src/data/pets.ts";
import {
  CatalogHarness,
  FILTER_TABS,
  matchesSearch,
  matchesCategory,
  computeTabCounts,
  inspectCatalogSource,
  isPuppy,
  isKitten,
  isSpecialNeeds,
  isSenior,
  isOtherAnimal,
} from "./helpers/catalog-harness.mjs";
import {
  inspectAdoptHtml,
  inspectNotFoundHtml,
  inspectNotFoundSource,
  inspectProfileSource,
  inspectPetCardSource,
  inspectPetModalSource,
  verifyWhatsAppCta,
  hasBuildArtifacts,
} from "./helpers/build-inspector.mjs";
import {
  auditCoreTokens,
  auditRequiredSelectors,
  auditMediaQueries,
} from "./helpers/css-auditor.mjs";
import {
  validateDynamicRouteStructure,
  validateStaticParamsContract,
  validateCompanionSlugs,
  validateNotFoundRoute,
} from "./helpers/route-validator.mjs";

describe("Tier 1: Comprehensive Feature Coverage (Features 1-16)", () => {
  // Feature 1: Real-time Search Bar
  describe("Feature 1: Real-time Search Bar", () => {
    it("T1.1.1: should filter pets by name (case-insensitive)", () => {
      const harness = new CatalogHarness();
      harness.setSearchQuery("kaju");
      const results = harness.getVisiblePets();
      assert.equal(results.length, 1);
      assert.equal(results[0].name, "Kaju");

      harness.setSearchQuery("DAISY");
      assert.equal(harness.getVisiblePets().length, 1);
      assert.equal(harness.getVisiblePets()[0].name, "Daisy");
    });

    it("T1.1.2: should filter pets by breed keyword", () => {
      const harness = new CatalogHarness();
      harness.setSearchQuery("Indie");
      const results = harness.getVisiblePets();
      assert.ok(results.length >= 5, "Expected at least 5 Indie pets");
      assert.ok(results.every((p) => p.breed.toLowerCase().includes("indie")));
    });

    it("T1.1.3: should filter pets by coat color", () => {
      const harness = new CatalogHarness();
      harness.setSearchQuery("Golden");
      const results = harness.getVisiblePets();
      assert.ok(results.length >= 1);
      assert.ok(results.some((p) => p.name === "Kaju"));
    });

    it("T1.1.4: should filter pets by adoption code with or without '#'", () => {
      const withHash = new CatalogHarness().setSearchQuery("#D01").getVisiblePets();
      assert.equal(withHash.length, 1);
      assert.equal(withHash[0].id, "kaju");

      const withoutHash = new CatalogHarness().setSearchQuery("D01").getVisiblePets();
      assert.equal(withoutHash.length, 1);
      assert.equal(withoutHash[0].id, "kaju");
    });

    it("T1.1.5: should filter pets across story and personality tags", () => {
      const tagMatch = new CatalogHarness().setSearchQuery("Lap Cuddler").getVisiblePets();
      assert.ok(tagMatch.some((p) => p.id === "kaju"));

      const storyMatch = new CatalogHarness().setSearchQuery("snuggles").getVisiblePets();
      assert.ok(storyMatch.some((p) => p.id === "kaju"));
    });
  });

  // Feature 2: Search Input Clear Action
  describe("Feature 2: Search Input Clear Action ('✕')", () => {
    it("T1.2.1: should clear query and restore all companions when cleared", () => {
      const harness = new CatalogHarness();
      harness.setSearchQuery("kaju");
      assert.equal(harness.getVisiblePets().length, 1);

      harness.clearSearch();
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.getVisiblePets().length, SAMPLE_PETS.length);
    });

    it("T1.2.2: should preserve active category filter when search is cleared", () => {
      const harness = new CatalogHarness();
      harness.setFilter("cats");
      harness.setSearchQuery("Amber");
      assert.equal(harness.getVisiblePets().length, 1);

      harness.clearSearch();
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.activeFilter, "cats");
      assert.equal(harness.getVisiblePets().length, 2); // Amber & Cleo
    });

    it("T1.2.3: catalog source component should include search clear button with '✕'", () => {
      const source = inspectCatalogSource();
      assert.ok(source.hasSearchClearBtn, "Missing search-clear-btn with '✕' icon");
    });
  });

  // Feature 3: Extended Filter Tabs
  describe("Feature 3: Extended Filter Tabs (8 options)", () => {
    it("T1.3.1: should define all 8 required filter tab IDs", () => {
      const tabIds = FILTER_TABS.map((t) => t.id);
      const expected = [
        "all",
        "dogs",
        "puppies",
        "cats",
        "kittens",
        "special-needs",
        "senior",
        "other",
      ];
      assert.deepEqual(tabIds, expected);
    });

    it("T1.3.2: should filter 'Dogs' correctly", () => {
      const dogs = new CatalogHarness().setFilter("dogs").getVisiblePets();
      assert.equal(dogs.length, 6);
      assert.ok(dogs.every((p) => p.species === "dog"));
    });

    it("T1.3.3: should filter 'Puppies' correctly", () => {
      const puppies = new CatalogHarness().setFilter("puppies").getVisiblePets();
      assert.equal(puppies.length, 5);
      assert.ok(puppies.every((p) => isPuppy(p)));
    });

    it("T1.3.4: should filter 'Cats' and 'Kittens' correctly", () => {
      const cats = new CatalogHarness().setFilter("cats").getVisiblePets();
      assert.equal(cats.length, 2);
      assert.ok(cats.every((p) => p.species === "cat"));

      const kittens = new CatalogHarness().setFilter("kittens").getVisiblePets();
      assert.equal(kittens.length, 1);
      assert.equal(kittens[0].id, "amber");
    });

    it("T1.3.5: should filter 'Special-needs', 'Senior', and 'Other Animals' correctly", () => {
      const special = new CatalogHarness().setFilter("special-needs").getVisiblePets();
      assert.equal(special.length, 1);
      assert.equal(special[0].id, "cleo");

      const senior = new CatalogHarness().setFilter("senior").getVisiblePets();
      assert.equal(senior.length, 1);
      assert.equal(senior[0].id, "rocky");

      const other = new CatalogHarness().setFilter("other").getVisiblePets();
      assert.equal(other.length, 1);
      assert.equal(other[0].id, "oreo");
    });
  });

  // Feature 4: Dynamic Category Counts
  describe("Feature 4: Dynamic Category Counts", () => {
    it("T1.4.1: should report accurate baseline counts for all 8 categories", () => {
      const counts = computeTabCounts(SAMPLE_PETS, "");
      assert.equal(counts.all, 9);
      assert.equal(counts.dogs, 6);
      assert.equal(counts.puppies, 5);
      assert.equal(counts.cats, 2);
      assert.equal(counts.kittens, 1);
      assert.equal(counts["special-needs"], 1);
      assert.equal(counts.senior, 1);
      assert.equal(counts.other, 1);
    });

    it("T1.4.2: counts should update dynamically when search query is applied", () => {
      const counts = computeTabCounts(SAMPLE_PETS, "amber");
      assert.equal(counts.all, 1);
      assert.equal(counts.dogs, 0);
      assert.equal(counts.cats, 1);
      assert.equal(counts.kittens, 1);
    });

    it("T1.4.3: catalog source component should render dynamic filter counts", () => {
      const source = inspectCatalogSource();
      assert.ok(source.hasFilterCounts, "Missing filter count markup in AdoptCatalogClient.tsx");
    });
  });

  // Feature 5: Informative Empty State & Reset
  describe("Feature 5: Informative Empty State & Reset", () => {
    it("T1.5.1: should trigger empty state when query matches zero companions", () => {
      const harness = new CatalogHarness().setSearchQuery("nonexistent-companion-xyz");
      assert.equal(harness.isEmpty(), true);
      assert.equal(harness.getVisiblePets().length, 0);
    });

    it("T1.5.2: should provide contextual empty state info", () => {
      const harness = new CatalogHarness()
        .setFilter("dogs")
        .setSearchQuery("cleo"); // Cleo is a cat
      assert.equal(harness.isEmpty(), true);
      const info = harness.getEmptyStateInfo();
      assert.ok(info.isEmpty);
      assert.equal(info.activeFilter, "dogs");
      assert.equal(info.query, "cleo");
    });

    it("T1.5.3: resetAll should restore catalog to 'All' category and empty query", () => {
      const harness = new CatalogHarness().setFilter("senior").setSearchQuery("kaju");
      assert.equal(harness.isEmpty(), true);

      harness.resetAll();
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.activeFilter, "all");
      assert.equal(harness.getVisiblePets().length, 9);
    });

    it("T1.5.4: catalog source should contain empty state markup, reset CTA, and WhatsApp link", () => {
      const source = inspectCatalogSource();
      assert.ok(source.hasEmptyState, "Missing empty state container");
      assert.ok(source.hasEmptyResetBtn, "Missing Reset All Filters CTA");
      assert.ok(source.hasEmptyWhatsAppCta, "Missing WhatsApp inquiry link in empty state");
    });
  });

  // Feature 6: Data Model & Schema Enhancement
  describe("Feature 6: Data Model & Schema Enhancement", () => {
    it("T1.6.1: all pets should satisfy PetProfile schema requirements", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(pet.id, `Pet missing id: ${pet.name}`);
        assert.ok(pet.adoptionCode, `Pet missing adoptionCode: ${pet.name}`);
        assert.ok(pet.name, `Pet missing name: ${pet.id}`);
        assert.ok(["dog", "cat", "other"].includes(pet.species), `Invalid species: ${pet.species}`);
        assert.ok(pet.breed, `Pet missing breed: ${pet.id}`);
        assert.ok(pet.age, `Pet missing age: ${pet.id}`);
        assert.ok(["Male", "Female"].includes(pet.gender), `Invalid gender: ${pet.gender}`);
        assert.ok(pet.size, `Pet missing size: ${pet.id}`);
        assert.ok(pet.color, `Pet missing color: ${pet.id}`);
        assert.ok(pet.image, `Pet missing image: ${pet.id}`);
        assert.ok(Array.isArray(pet.tags) && pet.tags.length > 0, `Pet missing tags: ${pet.id}`);
        assert.ok(pet.vaccinationStatus, `Pet missing vaccinationStatus: ${pet.id}`);
        assert.ok(pet.dewormedStatus, `Pet missing dewormedStatus: ${pet.id}`);
        assert.ok(pet.sterilisationStatus, `Pet missing sterilisationStatus: ${pet.id}`);
        assert.ok(pet.location, `Pet missing location: ${pet.id}`);
        assert.ok(pet.story, `Pet missing story: ${pet.id}`);
        assert.ok(pet.whatsappMessage, `Pet missing whatsappMessage: ${pet.id}`);
      }
    });

    it("T1.6.2: all pets should have multi-photo gallery with at least 3 photos", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.gallery) && pet.gallery.length >= 3,
          `Pet ${pet.id} has insufficient gallery images: ${pet.gallery?.length}`
        );
        for (const img of pet.gallery) {
          assert.match(img, /^\/images\/[1-7]\.jpeg$/, `Invalid gallery image path: ${img}`);
        }
      }
    });

    it("T1.6.3: all pets should have medical history with at least 3 clinical entries", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.medicalHistory) && pet.medicalHistory.length >= 3,
          `Pet ${pet.id} has insufficient medicalHistory: ${pet.medicalHistory?.length}`
        );
      }
    });

    it("T1.6.4: all pets should have adoption requirements with at least 3 household items", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.adoptionRequirements) && pet.adoptionRequirements.length >= 3,
          `Pet ${pet.id} has insufficient adoptionRequirements: ${pet.adoptionRequirements?.length}`
        );
      }
    });
  });

  // Feature 7: Next.js 15 404 & Build Stabilization
  describe("Feature 7: Next.js 15 404 & Build Stabilization", () => {
    it("T1.7.1: src/app/not-found.tsx should exist and satisfy route contracts", () => {
      const validation = validateNotFoundRoute();
      assert.ok(validation.exists, "src/app/not-found.tsx does not exist");
      assert.ok(validation.hasDefaultExport, "src/app/not-found.tsx missing default export");
      assert.ok(validation.hasAdoptLink, "src/app/not-found.tsx missing link to /adopt");
      assert.ok(validation.hasMetadata, "src/app/not-found.tsx missing metadata export");
    });

    it("T1.7.2: not-found page source should include cold trail messaging and WhatsApp support", () => {
      const info = inspectNotFoundSource();
      assert.ok(info.exists);
      assert.ok(info.hasColdTrailTitle, "Missing 'Looks Like This Trail Went Cold' title");
      assert.ok(info.hasWhatsAppLink, "Missing WhatsApp support link");
    });

    it("T1.7.3: static build should produce _not-found.html without ENOENT file tracing crashes", () => {
      if (hasBuildArtifacts()) {
        const buildInfo = inspectNotFoundHtml();
        assert.ok(buildInfo.exists, "_not-found.html missing from build output");
        assert.ok(buildInfo.hasAdoptLink, "_not-found.html missing /adopt link");
      }
    });
  });

  // Feature 8: Dynamic /adopt/[id] Route Contract
  describe("Feature 8: Dynamic /adopt/[id] Route Contract", () => {
    it("T1.8.1: generateStaticParams contract should produce params for all 9 companions", () => {
      const contract = validateStaticParamsContract(SAMPLE_PETS);
      assert.ok(contract.valid, "Static params contract validation failed");
      assert.equal(contract.totalParams, 9);
      assert.equal(contract.uniqueCount, 9);
    });

    it("T1.8.2: companion slugs should be URL-safe lowercase strings", () => {
      const slugValidation = validateCompanionSlugs(SAMPLE_PETS);
      assert.ok(slugValidation.allValid, `Invalid slugs: ${slugValidation.issues.join(", ")}`);
    });

    it("T1.8.3: dynamic route structure should export generateStaticParams and notFound", () => {
      const dynamicRoute = validateDynamicRouteStructure();
      if (dynamicRoute.exists) {
        assert.ok(dynamicRoute.hasGenerateStaticParams, "Missing generateStaticParams");
        assert.ok(dynamicRoute.hasNotFound, "Missing notFound() handler");
      }
    });
  });

  // Feature 9: Multi-photo Gallery
  describe("Feature 9: Multi-photo Gallery", () => {
    it("T1.9.1: gallery images must use assets in /images/1.jpeg through /images/7.jpeg", () => {
      for (const pet of SAMPLE_PETS) {
        for (const img of pet.gallery) {
          assert.match(img, /^\/images\/[1-7]\.jpeg$/);
        }
      }
    });

    it("T1.9.2: primary image should also be present in pet profile", () => {
      for (const pet of SAMPLE_PETS) {
        assert.match(pet.image, /^\/images\/[1-7]\.jpeg$/);
      }
    });
  });

  // Feature 10: Visible Pet ID Display (e.g. #D01)
  describe("Feature 10: Visible Pet ID Display", () => {
    it("T1.10.1: every pet should have a prominent adoption code starting with #", () => {
      for (const pet of SAMPLE_PETS) {
        assert.match(pet.adoptionCode, /^#[A-Z]\d{2}$/, `Invalid code: ${pet.adoptionCode}`);
      }
    });

    it("T1.10.2: PetModal source component displays adoption code", () => {
      const modalSource = inspectPetModalSource();
      assert.ok(modalSource.exists);
      assert.ok(modalSource.hasAdoptionCodeDisplay, "PetModal missing adoptionCode display");
    });
  });

  // Feature 11: Vitals & Personality Display
  describe("Feature 11: Vitals & Personality Display", () => {
    it("T1.11.1: all pets must specify age, gender, size, color, location", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(pet.age.length > 0);
        assert.ok(pet.gender === "Male" || pet.gender === "Female");
        assert.ok(pet.size.length > 0);
        assert.ok(pet.color.length > 0);
        assert.ok(pet.location.includes("Bangalore"));
      }
    });

    it("T1.11.2: all pets must specify rich personality tags", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(pet.tags.length >= 2, `Pet ${pet.id} has fewer than 2 tags`);
      }
    });
  });

  // Feature 12: Health & Medical History Section
  describe("Feature 12: Health & Medical History Section", () => {
    it("T1.12.1: vaccination, deworming, and sterilisation status must be clearly detailed", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(pet.vaccinationStatus.length > 0);
        assert.ok(pet.dewormedStatus.length > 0);
        assert.ok(pet.sterilisationStatus.length > 0);
      }
    });

    it("T1.12.2: PetModal component includes vaccination, dewormed, and sterilisation checklist", () => {
      const modalSource = inspectPetModalSource();
      assert.ok(modalSource.hasVaccination);
      assert.ok(modalSource.hasDewormed);
      assert.ok(modalSource.hasSterilisation);
    });
  });

  // Feature 13: Adoption Requirements Section
  describe("Feature 13: Adoption Requirements Section", () => {
    it("T1.13.1: household requirements must address safety and long-term care commitments", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(pet.adoptionRequirements.length >= 3);
        const combined = pet.adoptionRequirements.join(" ").toLowerCase();
        assert.ok(
          /safe|family|living|home|routine|care|pledge|vaccin|neutering|spay|contract/i.test(combined),
          `Pet ${pet.id} missing core adoption safety criteria`
        );
      }
    });
  });

  // Feature 14: Pre-filled WhatsApp Inquiry CTA
  describe("Feature 14: Pre-filled WhatsApp Inquiry CTA", () => {
    it("T1.14.1: every pet's inquiry URL should target official shelter number and include pet name & ID", () => {
      for (const pet of SAMPLE_PETS) {
        const url = `https://wa.me/918630438778?text=${encodeURIComponent(pet.whatsappMessage)}`;
        const verification = verifyWhatsAppCta(url, pet.name, pet.adoptionCode);
        assert.ok(verification.isValid, `Invalid WhatsApp CTA for ${pet.id}: ${verification.reason}`);
      }
    });
  });

  // Feature 15: Catalog & Modal Link Updates
  describe("Feature 15: Catalog & Modal Link Updates", () => {
    it("T1.15.1: PetCard component provides profile interaction hook", () => {
      const cardSource = inspectPetCardSource();
      assert.ok(cardSource.exists);
      assert.ok(cardSource.hasProfileLinkOrHandler, "PetCard missing profile view handler");
    });
  });

  // Feature 16: CSS Token Preservation & Responsive Breakpoints
  describe("Feature 16: CSS Token Preservation & Responsive Breakpoints", () => {
    it("T1.16.1: globals.css must strictly preserve all 5 core color tokens", () => {
      const tokenAudit = auditCoreTokens();
      assert.ok(
        tokenAudit.allValid,
        `Core token audit failed: ${JSON.stringify(tokenAudit.details, null, 2)}`
      );
    });

    it("T1.16.2: globals.css must include all required Step 4 catalog and empty state selectors", () => {
      const selectorAudit = auditRequiredSelectors();
      assert.ok(
        selectorAudit.allPresent,
        `Missing selectors: ${JSON.stringify(
          Object.entries(selectorAudit.details).filter(([, v]) => !v),
          null,
          2
        )}`
      );
    });

    it("T1.16.3: globals.css must include responsive breakpoints for 960px (tablet) and 640px (mobile)", () => {
      const mediaAudit = auditMediaQueries();
      assert.ok(mediaAudit.hasTabletQuery, "Missing @media (max-width: 960px)");
      assert.ok(mediaAudit.hasMobileQuery, "Missing @media (max-width: 640px)");
      assert.ok(mediaAudit.mobileChecks.hasSearchInputMobile, "Missing mobile search-input styling");
      assert.ok(mediaAudit.mobileChecks.hasFilterBarMobile, "Missing mobile filter-bar styling");
      assert.ok(mediaAudit.mobileChecks.hasEmptyStateMobile, "Missing mobile empty-state styling");
    });
  });
});
