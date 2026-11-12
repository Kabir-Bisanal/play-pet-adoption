import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { SAMPLE_PETS } from "../src/data/pets.ts";
import { SITE_CONFIG, buildWhatsAppUrl } from "../src/config/site.ts";
import {
  CatalogHarness,
  computeTabCounts,
  FILTER_TABS,
} from "./helpers/catalog-harness.mjs";
import {
  validateStaticParamsContract,
} from "./helpers/route-validator.mjs";
import { verifyWhatsAppCta } from "./helpers/build-inspector.mjs";

describe("Tier 3: Cross-Feature & Combinatorial Tests", () => {
  // Combination 1: Pairwise Search Query × Filter Tab Matrix
  describe("CF1: Search Query × Filter Tab Conjunction Matrix", () => {
    const testMatrix = [
      // { query, tab, expectedCount, sampleIds }
      { query: "Amber", tab: "all", expectedCount: 1, sampleIds: ["amber"] },
      { query: "Amber", tab: "cats", expectedCount: 1, sampleIds: ["amber"] },
      { query: "Amber", tab: "kittens", expectedCount: 1, sampleIds: ["amber"] },
      { query: "Amber", tab: "dogs", expectedCount: 0, sampleIds: [] },
      { query: "Amber", tab: "puppies", expectedCount: 0, sampleIds: [] },
      { query: "Kaju", tab: "all", expectedCount: 1, sampleIds: ["kaju"] },
      { query: "Kaju", tab: "dogs", expectedCount: 1, sampleIds: ["kaju"] },
      { query: "Kaju", tab: "puppies", expectedCount: 1, sampleIds: ["kaju"] },
      { query: "Kaju", tab: "cats", expectedCount: 0, sampleIds: [] },
      { query: "Kaju", tab: "senior", expectedCount: 0, sampleIds: [] },
      { query: "Indie", tab: "dogs", expectedCount: 6, sampleIds: ["kaju", "daisy", "simba", "shadow", "milo", "rocky"] },
      { query: "Indie", tab: "puppies", expectedCount: 5, sampleIds: ["kaju", "daisy", "simba", "shadow", "milo"] },
      { query: "Indie", tab: "senior", expectedCount: 1, sampleIds: ["rocky"] },
      { query: "Indie", tab: "cats", expectedCount: 0, sampleIds: [] },
      { query: "Indie", tab: "other", expectedCount: 0, sampleIds: [] },
      { query: "Rabbit", tab: "other", expectedCount: 1, sampleIds: ["oreo"] },
      { query: "Rabbit", tab: "dogs", expectedCount: 0, sampleIds: [] },
      { query: "Rabbit", tab: "cats", expectedCount: 0, sampleIds: [] },
    ];

    for (const { query, tab, expectedCount, sampleIds } of testMatrix) {
      it(`T3.1: Query '${query}' + Filter '${tab}' should yield ${expectedCount} companion(s)`, () => {
        const harness = new CatalogHarness().setFilter(tab).setSearchQuery(query);
        const visible = harness.getVisiblePets();
        assert.equal(visible.length, expectedCount, `Expected ${expectedCount} results for query '${query}' + tab '${tab}'`);
        for (const expectedId of sampleIds) {
          assert.ok(
            visible.some((p) => p.id === expectedId),
            `Expected pet '${expectedId}' in visible list for query '${query}' + tab '${tab}'`
          );
        }
      });
    }
  });

  // Combination 2: Clear Search with Active Category Filter Interaction
  describe("CF2: Clear Search with Active Filter Interaction", () => {
    it("T3.2.1: clearing search while 'dogs' filter is active preserves 'dogs' filter", () => {
      const harness = new CatalogHarness();
      harness.setFilter("dogs");
      harness.setSearchQuery("kaju");
      assert.equal(harness.getVisiblePets().length, 1);

      harness.clearSearch();
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.activeFilter, "dogs");
      assert.equal(harness.getVisiblePets().length, 6);
      assert.ok(harness.getVisiblePets().every((p) => p.species === "dog"));
    });

    it("T3.2.2: clearing search while 'cats' filter is active preserves 'cats' filter", () => {
      const harness = new CatalogHarness();
      harness.setFilter("cats");
      harness.setSearchQuery("Amber");
      assert.equal(harness.getVisiblePets().length, 1);

      harness.clearSearch();
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.activeFilter, "cats");
      assert.equal(harness.getVisiblePets().length, 2);
    });

    it("T3.2.3: clearing search while 'special-needs' filter is active preserves category", () => {
      const harness = new CatalogHarness();
      harness.setFilter("special-needs");
      harness.setSearchQuery("Cleo");
      assert.equal(harness.getVisiblePets().length, 1);

      harness.clearSearch();
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.activeFilter, "special-needs");
      assert.equal(harness.getVisiblePets().length, 1);
      assert.equal(harness.getVisiblePets()[0].id, "cleo");
    });
  });

  // Combination 3: Reset All Filters from Empty State
  describe("CF3: Reset All Filters from Empty State Transitions", () => {
    it("T3.3.1: reset from category mismatch empty state restores full catalog", () => {
      // Filter 'senior' + query 'daisy' (Daisy is a puppy) -> 0 results
      const harness = new CatalogHarness().setFilter("senior").setSearchQuery("daisy");
      assert.equal(harness.isEmpty(), true);
      assert.equal(harness.getVisiblePets().length, 0);

      harness.resetAll();
      assert.equal(harness.activeFilter, "all");
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.isEmpty(), false);
      assert.equal(harness.getVisiblePets().length, SAMPLE_PETS.length);
    });

    it("T3.3.2: reset from typo empty state restores full catalog", () => {
      const harness = new CatalogHarness().setFilter("all").setSearchQuery("goldennn");
      assert.equal(harness.isEmpty(), true);

      harness.resetAll();
      assert.equal(harness.activeFilter, "all");
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.getVisiblePets().length, SAMPLE_PETS.length);
    });

    it("T3.3.3: reset from cross-species empty state restores full catalog", () => {
      const harness = new CatalogHarness().setFilter("dogs").setSearchQuery("Rabbit");
      assert.equal(harness.isEmpty(), true);

      harness.resetAll();
      assert.equal(harness.activeFilter, "all");
      assert.equal(harness.searchQuery, "");
      assert.equal(harness.getVisiblePets().length, SAMPLE_PETS.length);
    });
  });

  // Combination 4: Dynamic Badge Count Invariance Across Active Tab Switches
  describe("CF4: Dynamic Badge Count Invariance Across Tab Switches", () => {
    it("T3.4.1: tab badge counts must be strictly invariant to which tab is active", () => {
      const testQueries = ["", "indie", "cuddler", "golden", "month"];

      for (const query of testQueries) {
        const expectedCounts = computeTabCounts(SAMPLE_PETS, query);

        for (const tab of FILTER_TABS) {
          const harness = new CatalogHarness().setFilter(tab.id).setSearchQuery(query);
          const computed = harness.getCounts();

          assert.deepEqual(
            computed,
            expectedCounts,
            `Count changed when switching active tab to '${tab.id}' with query '${query}'`
          );
        }
      }
    });

    it("T3.4.2: tab count sum consistency: dogs + cats + other must equal total species count", () => {
      const counts = computeTabCounts(SAMPLE_PETS, "");
      assert.equal(counts.dogs + counts.cats + counts.other, counts.all);
    });
  });

  // Combination 5: Catalog Card Link ↔ Dynamic Static Params Synchronization
  describe("CF5: Catalog Card Link ↔ Dynamic Route Params Synchronization", () => {
    it("T3.5.1: every catalog card item must correspond to a valid prerendered route slug", () => {
      const staticContract = validateStaticParamsContract(SAMPLE_PETS);
      assert.ok(staticContract.valid);

      const knownSlugs = new Set(staticContract.params.map((p) => p.id));

      for (const pet of SAMPLE_PETS) {
        // Card navigates to `/adopt/${pet.id}`
        const expectedRoute = `/adopt/${pet.id}`;
        assert.ok(
          knownSlugs.has(pet.id),
          `Pet '${pet.id}' from catalog is not registered in generateStaticParams contract`
        );
        assert.match(
          expectedRoute,
          /^\/adopt\/[a-z0-9-]+$/,
          `Pet route '${expectedRoute}' is not a valid URL slug path`
        );
      }
    });
  });

  // Combination 6: WhatsApp Message Content Synchronization
  describe("CF6: WhatsApp Message ↔ Pet Profile Synchronization", () => {
    it("T3.6.1: every pet's WhatsApp CTA must encode the official site number, name, and adoption code", () => {
      for (const pet of SAMPLE_PETS) {
        const generatedUrl = buildWhatsAppUrl(pet.whatsappMessage);

        // Verify base URL and phone number
        assert.ok(
          generatedUrl.startsWith(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=`),
          `Pet '${pet.id}' has invalid WhatsApp base URL: ${generatedUrl}`
        );

        // Verify content includes pet name
        const verification = verifyWhatsAppCta(generatedUrl, pet.name, pet.adoptionCode);
        assert.ok(
          verification.isValid,
          `Pet '${pet.id}' WhatsApp CTA verification failed: ${verification.reason}`
        );
      }
    });
  });
});
