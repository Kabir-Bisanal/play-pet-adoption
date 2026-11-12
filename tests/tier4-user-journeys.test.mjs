import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { SAMPLE_PETS } from "../src/data/pets.ts";
import { SITE_CONFIG, buildWhatsAppUrl } from "../src/config/site.ts";
import {
  CatalogHarness,
  computeTabCounts,
} from "./helpers/catalog-harness.mjs";
import {
  inspectNotFoundSource,
  verifyWhatsAppCta,
} from "./helpers/build-inspector.mjs";
import {
  validateStaticParamsContract,
} from "./helpers/route-validator.mjs";

describe("Tier 4: Real-World End-to-End User Journeys", () => {
  // Scenario 1: The Puppy Seeker Workflow
  describe("Scenario 1: Puppy Seeker Journey", () => {
    it("T4.1: simulates a user searching for lap cuddler puppies, inspecting vitals, and inquiring via WhatsApp", () => {
      // Step 1: User arrives at /adopt catalog
      const catalog = new CatalogHarness();
      assert.equal(catalog.getVisiblePets().length, SAMPLE_PETS.length);
      assert.equal(catalog.getCounts().all, 9);

      // Step 2: User clicks "Puppies" filter tab
      catalog.setFilter("puppies");
      const puppyList = catalog.getVisiblePets();
      assert.equal(puppyList.length, 5);
      assert.ok(puppyList.every((p) => p.badgeLabel === "Puppy" || p.tags.includes("Puppy")));

      // Step 3: User filters with keyword "snuggles"
      catalog.setSearchQuery("snuggles");
      const matched = catalog.getVisiblePets();
      assert.equal(matched.length, 1);
      const chosenPet = matched[0];
      assert.equal(chosenPet.id, "kaju");
      assert.equal(chosenPet.adoptionCode, "#D01");

      // Step 4: Verify profile details for Kaju
      assert.equal(chosenPet.species, "dog");
      assert.equal(chosenPet.gender, "Male");
      assert.equal(chosenPet.color, "Golden Fawn");
      assert.ok(chosenPet.gallery.length >= 3);
      assert.ok(chosenPet.vaccinationStatus.length > 0);
      assert.ok(chosenPet.sterilisationStatus.length > 0);
      assert.ok(chosenPet.medicalHistory.length >= 3);
      assert.ok(chosenPet.adoptionRequirements.length >= 3);

      // Step 5: User triggers WhatsApp pre-filled inquiry CTA
      const waUrl = buildWhatsAppUrl(chosenPet.whatsappMessage);
      const waCheck = verifyWhatsAppCta(waUrl, chosenPet.name, chosenPet.adoptionCode);
      assert.ok(waCheck.isValid, `WhatsApp CTA failed: ${waCheck.reason}`);
      assert.ok(waCheck.decodedText.includes("Kaju"));
      assert.ok(waCheck.decodedText.includes("#D01"));
    });
  });

  // Scenario 2: Special-Needs Companion Workflow
  describe("Scenario 2: Special-Needs Companion Journey", () => {
    it("T4.2: simulates an adopter looking for special-needs rescues, checking medical background and requirements", () => {
      // Step 1: User arrives at catalog and filters by "Special-needs"
      const catalog = new CatalogHarness().setFilter("special-needs");
      const specialPets = catalog.getVisiblePets();
      assert.equal(specialPets.length, 1);
      const specialPet = specialPets[0];
      assert.equal(specialPet.id, "cleo");
      assert.equal(specialPet.adoptionCode, "#C02");
      assert.equal(specialPet.isSpecialNeeds, true);

      // Step 2: Adopter inspects Cleo's clinic history and special care requirements
      assert.ok(specialPet.medicalHistory.some((entry) => /surgery|orthopedic|three-legged|amputation/i.test(entry)));
      assert.ok(specialPet.adoptionRequirements.some((req) => /netting|indoor|stairs|carpet/i.test(req)));

      // Step 3: Adopter clicks inquiry button
      const waUrl = buildWhatsAppUrl(specialPet.whatsappMessage);
      const waCheck = verifyWhatsAppCta(waUrl, "Cleo", "#C02");
      assert.ok(waCheck.isValid);
      assert.ok(waCheck.decodedText.includes("Cleo"));
    });
  });

  // Scenario 3: Senior Cat Adoption Workflow
  describe("Scenario 3: Senior & Cat Multi-Facet Journey", () => {
    it("T4.3: simulates user exploring cats, viewing kittens, and checking senior animals", () => {
      const catalog = new CatalogHarness();

      // Step 1: User explores Cats tab
      catalog.setFilter("cats");
      assert.equal(catalog.getVisiblePets().length, 2);

      // Step 2: User narrows down to Kittens
      catalog.setFilter("kittens");
      const kittens = catalog.getVisiblePets();
      assert.equal(kittens.length, 1);
      const amber = kittens[0];
      assert.equal(amber.id, "amber");
      assert.equal(amber.badgeLabel, "Kitten");
      assert.ok(amber.gallery.includes("/images/6.jpeg") || amber.gallery.length >= 3);

      // Step 3: User checks Senior companions
      catalog.setFilter("senior");
      const seniors = catalog.getVisiblePets();
      assert.equal(seniors.length, 1);
      const rocky = seniors[0];
      assert.equal(rocky.id, "rocky");
      assert.equal(rocky.isSenior, true);
      assert.ok(parseInt(rocky.age, 10) >= 7, `Expected senior age >= 7, got: ${rocky.age}`);

      // Step 4: Verify Rocky's WhatsApp CTA
      const waUrl = buildWhatsAppUrl(rocky.whatsappMessage);
      const waCheck = verifyWhatsAppCta(waUrl, "Rocky", "#D06");
      assert.ok(waCheck.isValid);
    });
  });

  // Scenario 4: Typo & Empty State Recovery
  describe("Scenario 4: Search Miss & Recovery Journey", () => {
    it("T4.4: simulates user making a spelling typo, encountering empty state, resetting, and finding their pet", () => {
      const catalog = new CatalogHarness();

      // Step 1: User types typo "pupppie"
      catalog.setSearchQuery("pupppie");
      assert.equal(catalog.isEmpty(), true);
      assert.equal(catalog.getVisiblePets().length, 0);

      const emptyInfo = catalog.getEmptyStateInfo();
      assert.ok(emptyInfo.isEmpty);
      assert.equal(emptyInfo.query, "pupppie");
      assert.equal(emptyInfo.hasResetAction, true);

      // Step 2: User clicks "Reset All Filters"
      catalog.resetAll();
      assert.equal(catalog.isEmpty(), false);
      assert.equal(catalog.getVisiblePets().length, SAMPLE_PETS.length);
      assert.equal(catalog.searchQuery, "");
      assert.equal(catalog.activeFilter, "all");

      // Step 3: User searches correctly "Daisy"
      catalog.setSearchQuery("Daisy");
      assert.equal(catalog.getVisiblePets().length, 1);
      assert.equal(catalog.getVisiblePets()[0].id, "daisy");
    });
  });

  // Scenario 5: Invalid Route Navigation & 404 Recovery
  describe("Scenario 5: 404 Navigation Recovery Journey", () => {
    it("T4.5: verifies 404 handling structure and recovery paths back to /adopt", () => {
      // Step 1: User navigates to a pet ID that doesn't exist
      const invalidPetId = "ghost-companion-999";
      const pet = SAMPLE_PETS.find((p) => p.id === invalidPetId);
      assert.equal(pet, undefined, "Invalid pet ID should not match any sample pet");

      // Step 2: 404 page provides warm recovery path
      const notFoundSource = inspectNotFoundSource();
      assert.ok(notFoundSource.exists, "src/app/not-found.tsx must exist to intercept 404s");
      assert.ok(notFoundSource.hasAdoptLink, "404 page must provide link back to /adopt");
      assert.ok(notFoundSource.hasWhatsAppLink, "404 page must provide WhatsApp help link");

      // Step 3: Verify that returning to /adopt loads all companions
      const catalog = new CatalogHarness();
      assert.equal(catalog.getVisiblePets().length, SAMPLE_PETS.length);
    });
  });
});
