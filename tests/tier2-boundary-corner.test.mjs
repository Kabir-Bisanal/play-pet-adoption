import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { SAMPLE_PETS } from "../src/data/pets.ts";
import {
  CatalogHarness,
  matchesSearch,
  matchesCategory,
  computeTabCounts,
  isPuppy,
  isKitten,
  isSpecialNeeds,
  isSenior,
  isOtherAnimal,
  normalize,
} from "./helpers/catalog-harness.mjs";
import { verifyWhatsAppCta } from "./helpers/build-inspector.mjs";

describe("Tier 2: Boundary, Corner & Negative Tests", () => {
  // Dimension 1: Empty and Whitespace Handling
  describe("B1: Empty and Whitespace Handling", () => {
    it("T2.1.1: empty string query ('') should return all companions for active category", () => {
      const harness = new CatalogHarness().setFilter("all").setSearchQuery("");
      assert.equal(harness.getVisiblePets().length, SAMPLE_PETS.length);

      harness.setFilter("dogs").setSearchQuery("");
      assert.equal(harness.getVisiblePets().length, 6);
    });

    it("T2.1.2: whitespace-only queries (' ', '\\t', '\\n') should be trimmed and treated as empty", () => {
      const whitespaceInputs = [" ", "   ", "\t", "\t\t", "\n", " \t \n "];
      for (const input of whitespaceInputs) {
        const harness = new CatalogHarness().setSearchQuery(input);
        assert.equal(
          harness.getVisiblePets().length,
          SAMPLE_PETS.length,
          `Failed for whitespace input: ${JSON.stringify(input)}`
        );
        assert.equal(harness.isEmpty(), false);
      }
    });

    it("T2.1.3: leading and trailing whitespace around valid tokens should match cleanly", () => {
      const paddedInputs = [
        { query: "  kaju  ", expectedId: "kaju" },
        { query: "\tdaisy\t", expectedId: "daisy" },
        { query: " \n #D01 \n ", expectedId: "kaju" },
        { query: "   Golden Fawn   ", expectedId: "kaju" },
      ];

      for (const { query, expectedId } of paddedInputs) {
        const harness = new CatalogHarness().setSearchQuery(query);
        const matches = harness.getVisiblePets();
        assert.ok(
          matches.some((p) => p.id === expectedId),
          `Failed to match '${expectedId}' for padded query '${query}'`
        );
      }
    });
  });

  // Dimension 2: Case-Insensitive Matching
  describe("B2: Case Insensitivity & Normalization", () => {
    it("T2.2.1: search must match uppercase, lowercase, and mixed-case queries identically", () => {
      const caseVariants = ["kaju", "KAJU", "Kaju", "kAjU", "KaJu"];
      for (const variant of caseVariants) {
        const harness = new CatalogHarness().setSearchQuery(variant);
        const results = harness.getVisiblePets();
        assert.equal(results.length, 1, `Failed case invariance for '${variant}'`);
        assert.equal(results[0].id, "kaju");
      }
    });

    it("T2.2.2: adoption code matching must be case-insensitive with or without '#'", () => {
      const codeVariants = ["#d01", "#D01", "d01", "D01", "#c01", "C01"];
      for (const code of codeVariants) {
        const harness = new CatalogHarness().setSearchQuery(code);
        const results = harness.getVisiblePets();
        assert.ok(results.length >= 1, `Failed to match adoption code '${code}'`);
      }
    });

    it("T2.2.3: breed, color, and story case insensitivity", () => {
      const harness1 = new CatalogHarness().setSearchQuery("iNdIe MiX");
      assert.ok(harness1.getVisiblePets().length >= 5);

      const harness2 = new CatalogHarness().setSearchQuery("cReAm");
      assert.ok(harness2.getVisiblePets().some((p) => p.id === "daisy"));

      const harness3 = new CatalogHarness().setSearchQuery("SNUGGLES");
      assert.ok(harness3.getVisiblePets().some((p) => p.id === "kaju"));
    });
  });

  // Dimension 3: Regex Metacharacters and Format-Specific Meta-Characters
  describe("B3: Adversarial Input & Regex Metacharacters", () => {
    it("T2.3.1: regex control characters in search query must not throw syntax errors", () => {
      const regexInputs = [
        ".*",
        "[a-z]+",
        "(dog|cat)",
        "^$",
        "\\d+",
        "???",
        "+++",
        "***",
        "{1,3}",
        "\\b\\w+\\b",
        "[$^&*()+=\\[\\]{}|\\\\;:'\",.<>/?]",
      ];

      for (const input of regexInputs) {
        assert.doesNotThrow(() => {
          const harness = new CatalogHarness().setSearchQuery(input);
          const visible = harness.getVisiblePets();
          // Either matches literal characters or returns 0 safely
          assert.ok(Array.isArray(visible));
        }, `Threw exception for adversarial input: '${input}'`);
      }
    });

    it("T2.3.2: HTML/XML script tags and injection payloads must be treated as benign text", () => {
      const maliciousInputs = [
        "<script>alert('xss')</script>",
        "javascript:void(0)",
        "<img src=x onerror=alert(1)>",
        "\"'--><svg/onload=alert(1)>",
      ];

      for (const input of maliciousInputs) {
        assert.doesNotThrow(() => {
          const harness = new CatalogHarness().setSearchQuery(input);
          assert.equal(harness.getVisiblePets().length, 0);
          assert.equal(harness.isEmpty(), true);
        });
      }
    });
  });

  // Dimension 4: Zero Matches & Nonexistent Companion Queries
  describe("B4: Zero Results & Empty State Boundaries", () => {
    it("T2.4.1: searching for nonexistent tokens should cleanly return 0 companions", () => {
      const nonexistentQueries = [
        "zzzznonexistentcompanion999",
        "chupacabra",
        "unicorn",
        "0000000000",
        "#Z99",
      ];

      for (const query of nonexistentQueries) {
        const harness = new CatalogHarness().setSearchQuery(query);
        assert.equal(harness.getVisiblePets().length, 0);
        assert.equal(harness.isEmpty(), true);
        const info = harness.getEmptyStateInfo();
        assert.ok(info.isEmpty);
        assert.equal(info.query, query);
      }
    });

    it("T2.4.2: emoji and foreign character queries should execute safely", () => {
      const unicodeQueries = ["🐾", "🐶🐱", "こんにちは", "مرحبا", "नमस्ते"];
      for (const query of unicodeQueries) {
        assert.doesNotThrow(() => {
          const harness = new CatalogHarness().setSearchQuery(query);
          const results = harness.getVisiblePets();
          assert.ok(Array.isArray(results));
        });
      }
    });
  });

  // Dimension 5: Data Model Resilience & Optional Attributes
  describe("B5: Optional Attribute & Null Safety", () => {
    it("T2.5.1: matchesSearch should safely handle pets with null or undefined attributes", () => {
      const minimalPet = {
        id: "minimal",
        adoptionCode: "#M01",
        name: "Minimal",
        species: "dog",
        badgeLabel: "Puppy",
        breed: "Mix",
        age: "3 Months",
        gender: "Male",
        size: "Medium",
        color: "Brown",
        image: "/images/1.jpeg",
        gallery: ["/images/1.jpeg", "/images/2.jpeg", "/images/3.jpeg"],
        alt: "",
        tags: [],
        vaccinationStatus: "Up to date",
        dewormedStatus: "Yes",
        sterilisationStatus: "No",
        medicalHistory: ["Checkup passed", "Vaccinated", "Dewormed"],
        adoptionRequirements: ["Safe home", "Daily care", "Adoption agreement"],
        location: "Bangalore",
        story: "",
        whatsappMessage: "Hi",
        isSpecialNeeds: undefined,
        isSenior: undefined,
      };

      assert.doesNotThrow(() => {
        assert.equal(matchesSearch(minimalPet, "Minimal"), true);
        assert.equal(matchesSearch(minimalPet, "nomatch"), false);
        assert.equal(matchesCategory(minimalPet, "special-needs"), false);
        assert.equal(matchesCategory(minimalPet, "senior"), false);
        assert.equal(matchesCategory(minimalPet, "dogs"), true);
      });
    });

    it("T2.5.2: normalize helper should safely handle null, undefined, and non-string inputs", () => {
      assert.equal(normalize(null), "");
      assert.equal(normalize(undefined), "");
      assert.equal(normalize(""), "");
      assert.equal(normalize(123), "123");
      assert.equal(normalize(false), "");
    });

    it("T2.5.3: computeTabCounts should safely handle an empty pet array", () => {
      const emptyCounts = computeTabCounts([], "any");
      assert.deepEqual(emptyCounts, {
        all: 0,
        dogs: 0,
        puppies: 0,
        cats: 0,
        kittens: 0,
        "special-needs": 0,
        senior: 0,
        other: 0,
      });
    });
  });

  // Dimension 6: WhatsApp URL Boundary & Format Rigor
  describe("B6: WhatsApp CTA Boundary & Format Rigor", () => {
    it("T2.6.1: verifyWhatsAppCta should reject malformed or non-string inputs", () => {
      assert.equal(verifyWhatsAppCta(null).isValid, false);
      assert.equal(verifyWhatsAppCta("").isValid, false);
      assert.equal(verifyWhatsAppCta("https://malicious-site.com").isValid, false);
      assert.equal(verifyWhatsAppCta(12345).isValid, false);
    });

    it("T2.6.2: verifyWhatsAppCta should enforce exact phone number 918630438778", () => {
      const correctUrl = "https://wa.me/918630438778?text=Hello%20Kaju";
      const wrongNumberUrl = "https://wa.me/919999999999?text=Hello%20Kaju";

      assert.equal(verifyWhatsAppCta(correctUrl).isValid, true);
      assert.equal(verifyWhatsAppCta(wrongNumberUrl).isValid, false);
    });

    it("T2.6.3: verifyWhatsAppCta should detect missing expected name or adoption code", () => {
      const validUrl = "https://wa.me/918630438778?text=Inquiring%20about%20Kaju%20%23D01";
      const noCodeUrl = "https://wa.me/918630438778?text=Inquiring%20about%20Kaju";

      assert.ok(verifyWhatsAppCta(validUrl, "Kaju", "#D01").isValid);
      assert.equal(verifyWhatsAppCta(noCodeUrl, "Kaju", "#D01").isValid, false);
    });
  });
});
