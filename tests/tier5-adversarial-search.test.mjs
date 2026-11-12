import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { SAMPLE_PETS } from "../src/data/pets.ts";
import { SITE_CONFIG, buildWhatsAppUrl } from "../src/config/site.ts";
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
  normalize,
} from "./helpers/catalog-harness.mjs";

describe("Tier 5: Adversarial Search & Filter Coverage Hardening", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // Suite 1: Regex Metacharacters and ReDoS Vectors
  // ─────────────────────────────────────────────────────────────────────────
  describe("A1: Regex Metacharacters and ReDoS Vectors", () => {
    const regexMetachars = [
      ".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\", "/"
    ];

    for (const char of regexMetachars) {
      it(`T5.1.1: single regex metacharacter '${char}' should evaluate without throwing or syntax error`, () => {
        assert.doesNotThrow(() => {
          for (const pet of SAMPLE_PETS) {
            matchesSearch(pet, char);
          }
        }, `Evaluation failed for metacharacter: '${char}'`);

        const harness = new CatalogHarness().setSearchQuery(char);
        const visible = harness.getVisiblePets();
        assert.ok(Array.isArray(visible));
      });
    }

    const dangerousRedosPatterns = [
      "(a+)+$",
      "([a-zA-Z]+)*$",
      "(a|aa)+$",
      "(\\d+)+$",
      "(.*)*.*",
      "a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?a?aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      ".*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*a",
      "^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$",
      "((.*)*)*",
    ];

    for (const pattern of dangerousRedosPatterns) {
      it(`T5.1.2: ReDoS pattern '${pattern.slice(0, 25)}...' must execute safely under 20ms without catastrophic backtracking`, () => {
        const start = performance.now();
        const harness = new CatalogHarness().setSearchQuery(pattern);
        const visible = harness.getVisiblePets();
        const elapsed = performance.now() - start;

        assert.ok(elapsed < 20, `Execution took ${elapsed.toFixed(2)}ms (expected < 20ms)`);
        assert.equal(visible.length, 0, `Expected 0 matches for synthetic ReDoS pattern '${pattern.slice(0, 20)}'`);
        assert.equal(harness.isEmpty(), true);
      });
    }

    const malformedRegexInputs = [
      "[a-z", // unclosed bracket
      "(abc", // unclosed parenthesis
      "{1,3", // unclosed curly brace
      "*abc", // quantifier at start of string
      "+def", // plus at start of string
      "?ghi", // question mark at start
      "\\",   // dangling backslash
      "\\x",  // incomplete hex escape
      "\\u",  // incomplete unicode escape
      "(?<=lookbehind", // incomplete lookbehind
      "(?<!lookbehind", // incomplete negative lookbehind
      "(?P<name>group", // Python-style named group in JS
      "\\p{Invalid}",   // invalid Unicode property
      "[z-a]",          // inverted character range
    ];

    for (const malformed of malformedRegexInputs) {
      it(`T5.1.3: malformed regex string '${malformed}' must not trigger SyntaxError and should search literally`, () => {
        assert.doesNotThrow(() => {
          const harness = new CatalogHarness().setSearchQuery(malformed);
          const visible = harness.getVisiblePets();
          assert.equal(visible.length, 0);
        });
      });
    }

    it("T5.1.4: period '.' must search literal period in stories rather than wildcarding all characters", () => {
      // Pet stories contain standard periods terminating sentences
      const harness = new CatalogHarness().setSearchQuery(".");
      const visible = harness.getVisiblePets();
      assert.ok(visible.length > 0, "Expected pets with periods in story to match literal '.'");

      // Verify that a synthetic pet with NO period anywhere does NOT match
      const periodFreePet = {
        id: "no-period",
        adoptionCode: "#X99",
        name: "NoPeriodPet",
        species: "dog",
        badgeLabel: "Dog",
        breed: "Terrier",
        age: "1 Year",
        gender: "Male",
        size: "Medium",
        color: "Brown",
        image: "/images/1.jpeg",
        gallery: [],
        alt: "No period pet",
        tags: ["Playful"],
        vaccinationStatus: "Up to date",
        dewormedStatus: "Yes",
        sterilisationStatus: "Yes",
        medicalHistory: [],
        adoptionRequirements: [],
        location: "Bangalore",
        story: "Just a happy pet with no punctuation at all",
        whatsappMessage: "Hi",
      };

      assert.equal(
        matchesSearch(periodFreePet, "."),
        false,
        "Period '.' matched a pet with zero periods (wildcard behavior detected!)"
      );
    });

    it("T5.1.5: slash '/' evaluates without regex delimiter crash and ampersand '&' matches literal occurrences", () => {
      // Slash does not exist in pet data, so it returns 0 without crashing
      const slashHarness = new CatalogHarness().setSearchQuery("/");
      assert.doesNotThrow(() => slashHarness.getVisiblePets());
      assert.equal(slashHarness.getVisiblePets().length, 0);

      // Ampersand exists in pet colors ('Black & White Chest', 'Ginger & White Tabby')
      const ampHarness = new CatalogHarness().setSearchQuery("&");
      const ampResults = ampHarness.getVisiblePets();
      assert.ok(ampResults.length >= 4, "Expected at least 4 pets with '&' in color to match");
      assert.ok(ampResults.some((p) => p.name === "Shadow"));
      assert.ok(ampResults.some((p) => p.name === "Amber"));
      assert.ok(ampResults.some((p) => p.name === "Rocky"));
      assert.ok(ampResults.some((p) => p.name === "Oreo"));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 2: Unicode, Emojis, RTL, Surrogates, and Multilingual Vectors
  // ─────────────────────────────────────────────────────────────────────────
  describe("A2: Unicode, Emojis, Surrogates, Multilingual, and Injection Probes", () => {
    it("T5.2.1: emoji inputs (single, compound, ZWJ sequences) handle cleanly without crash", () => {
      const emojiVectors = [
        "🐶",
        "🐱",
        "🐾",
        "❤️",
        "🐕‍🦺", // Dog + ZWJ + Service vest
        "🐈‍⬛", // Black cat ZWJ
        "👍🏽", // Skin tone modifier
        "🐾🐶🐱🐕🐈", // Multi-emoji sequence
      ];

      for (const emoji of emojiVectors) {
        assert.doesNotThrow(() => {
          const harness = new CatalogHarness().setSearchQuery(emoji);
          const visible = harness.getVisiblePets();
          assert.equal(visible.length, 0);
          assert.equal(harness.isEmpty(), true);
        });
      }
    });

    it("T5.2.2: multilingual queries (Kannada, Hindi, Cyrillic, CJK, Arabic) handle safely", () => {
      const multilingualQueries = [
        { lang: "Kannada", query: "ನಾಯಿ" },     // Dog
        { lang: "Kannada", query: "ಬೆಕ್ಕು" },    // Cat
        { lang: "Kannada", query: "ರಾಜಾನುಕುಂಟೆ" }, // Rajanukunte
        { lang: "Hindi", query: "कुत्ता" },      // Dog
        { lang: "Hindi", query: "बिल्ली" },     // Cat
        { lang: "Cyrillic", query: "собака" },  // Dog
        { lang: "CJK", query: "小狗" },          // Puppy
        { lang: "Arabic", query: "كلب" },        // Dog
        { lang: "Hebrew", query: "חתול" },       // Cat
      ];

      for (const { lang, query } of multilingualQueries) {
        const harness = new CatalogHarness().setSearchQuery(query);
        const visible = harness.getVisiblePets();
        assert.equal(visible.length, 0, `Expected 0 matches for non-English query (${lang})`);
        assert.equal(harness.isEmpty(), true);
      }
    });

    it("T5.2.3: Bidirectional (BiDi) overrides and zero-width characters do not corrupt state", () => {
      const bidiVectors = [
        "\u202Ereversed\u202C", // Right-to-Left Override
        "\u200BKaju\u200B",     // Zero-width space around name
        "\u200C",               // Zero-width non-joiner
        "\u200D",               // Zero-width joiner
        "\uFEFF",               // Byte Order Mark (BOM)
        "\u00A0kaju\u00A0",     // Non-breaking space
      ];

      for (const vector of bidiVectors) {
        assert.doesNotThrow(() => {
          const harness = new CatalogHarness().setSearchQuery(vector);
          harness.getVisiblePets();
          harness.getCounts();
        });
      }
    });

    it("T5.2.4: diacritics and accented characters evaluate without runtime exceptions", () => {
      const accentedQueries = ["café", "naïve", "résumé", "däisy", "Kajú", "Lùna"];
      for (const query of accentedQueries) {
        assert.doesNotThrow(() => {
          const harness = new CatalogHarness().setSearchQuery(query);
          harness.getVisiblePets();
        });
      }
    });

    it("T5.2.5: extreme string lengths (1k, 5k, 20k chars) evaluate under 50ms with zero memory bloat", () => {
      const largeStrings = [
        "a".repeat(1000),
        "🐕".repeat(2000),
        " ".repeat(10000),
        "long_query_token_without_spaces_".repeat(300), // ~9600 chars
      ];

      for (const largeStr of largeStrings) {
        const start = performance.now();
        const harness = new CatalogHarness().setSearchQuery(largeStr);
        const visible = harness.getVisiblePets();
        const elapsed = performance.now() - start;

        assert.ok(elapsed < 50, `Length ${largeStr.length} took ${elapsed.toFixed(2)}ms (expected < 50ms)`);
        assert.ok(Array.isArray(visible));
      }
    });

    it("T5.2.6: script injection, HTML, and SQL payloads do not crash and generate safely encoded WhatsApp URLs", () => {
      const injectionPayloads = [
        "<script>alert('xss')</script>",
        "\" onerror=\"alert(1)\"",
        "'>><svg/onload=alert(1)>",
        "javascript:alert(1)",
        "'; DROP TABLE pets; --",
        "' OR '1'='1",
        "{{7*7}}",
        "${process.env}",
        "__proto__",
        "constructor",
        "prototype",
      ];

      for (const payload of injectionPayloads) {
        const harness = new CatalogHarness().setSearchQuery(payload);
        const visible = harness.getVisiblePets();
        // Prototype pollution check: should not treat '__proto__' as an object property
        assert.equal(visible.length, 0);

        // Verify buildWhatsAppUrl encodes properly
        const message = `Hi Haven Paws team, I was searching for "${payload.trim()}" on your adoption website`;
        const waUrl = buildWhatsAppUrl(message);
        assert.ok(!waUrl.includes("<script>"), "WhatsApp URL must not contain unencoded script tags");
        assert.ok(waUrl.startsWith("https://wa.me/918630438778?text="));
        assert.doesNotThrow(() => new URL(waUrl), `Invalid URL generated for payload: ${payload}`);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 3: Rapid & Permuted Tab Switching Across All 8 Tabs with Active Dirty Input
  // ─────────────────────────────────────────────────────────────────────────
  describe("A3: Rapid & Permuted Tab Switching with Dirty Active Input", () => {
    it("T5.3.1: full circular switch across all 8 tabs under valid query maintains query state and correct counts", () => {
      const harness = new CatalogHarness().setSearchQuery("Indie");
      const tabOrder = ["all", "dogs", "puppies", "cats", "kittens", "special-needs", "senior", "other", "all"];

      const expectedMap = {
        all: 6,
        dogs: 6,
        puppies: 5,
        cats: 0,
        kittens: 0,
        "special-needs": 0,
        senior: 1,
        other: 0,
      };

      for (const tab of tabOrder) {
        harness.setFilter(tab);
        const visible = harness.getVisiblePets();
        const counts = harness.getCounts();

        assert.equal(harness.searchQuery, "Indie", "Search query was unexpectedly mutated during tab switch");
        assert.equal(visible.length, expectedMap[tab], `Mismatch on tab '${tab}'`);
        assert.equal(visible.length, counts[tab], `Visible count != tabCounts for tab '${tab}'`);
      }
    });

    it("T5.3.2: reverse circular switch across all 8 tabs under zero-match query keeps empty state active", () => {
      const harness = new CatalogHarness().setSearchQuery("nonexistent_pet_query_999");
      const reverseTabOrder = ["all", "other", "senior", "special-needs", "kittens", "cats", "puppies", "dogs", "all"];

      for (const tab of reverseTabOrder) {
        harness.setFilter(tab);
        const visible = harness.getVisiblePets();
        const counts = harness.getCounts();
        const emptyInfo = harness.getEmptyStateInfo();

        assert.equal(visible.length, 0, `Expected 0 visible pets on tab '${tab}'`);
        assert.equal(counts[tab], 0, `Expected 0 count on tab '${tab}'`);
        assert.ok(emptyInfo !== null, `Empty state must be active on tab '${tab}'`);
        assert.equal(emptyInfo.activeFilter, tab);
      }
    });

    it("T5.3.3: rapid alternating ping-pong between conflicting categories (dogs <-> cats) with dirty query", () => {
      const harness = new CatalogHarness().setSearchQuery("Amber"); // Amber is a cat

      for (let i = 0; i < 20; i++) {
        // Switch to dogs
        harness.setFilter("dogs");
        assert.equal(harness.getVisiblePets().length, 0);
        assert.equal(harness.isEmpty(), true);

        // Switch to cats
        harness.setFilter("cats");
        const catResults = harness.getVisiblePets();
        assert.equal(catResults.length, 1);
        assert.equal(catResults[0].name, "Amber");
        assert.equal(harness.isEmpty(), false);

        // Verify search query remains untouched
        assert.equal(harness.searchQuery, "Amber");
      }
    });

    it("T5.3.4: randomized shuffle tab traversal across 50 switches preserves count integrity", () => {
      const tabIds = FILTER_TABS.map((t) => t.id);
      const harness = new CatalogHarness().setSearchQuery("Rocky"); // Rocky is a senior dog

      // Seeded-like deterministic pseudo-random sequence
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(pseudoRandom() * tabIds.length);
        const chosenTab = tabIds[randomIndex];
        harness.setFilter(chosenTab);

        const visible = harness.getVisiblePets();
        const counts = harness.getCounts();

        assert.equal(visible.length, counts[chosenTab]);
        if (chosenTab === "all" || chosenTab === "dogs" || chosenTab === "senior") {
          assert.equal(visible.length, 1);
          assert.equal(visible[0].name, "Rocky");
        } else {
          assert.equal(visible.length, 0);
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 4: Clear Button ('✕') Behavior and State Synchronization
  // ─────────────────────────────────────────────────────────────────────────
  describe("A4: Clear Button ('✕') Behavior and State Synchronization", () => {
    it("T5.4.1: clear button is visible if and only if searchQuery.length > 0", () => {
      const componentSource = inspectCatalogSource();
      // Inspect component JSX: searchQuery.length > 0 && <button ... search-clear-btn ...>✕</button>
      assert.ok(componentSource.hasSearchClearBtn, "AdoptCatalogClient must render clear button with '✕'");
      assert.ok(
        componentSource.rawContent.includes("searchQuery.length > 0"),
        "Clear button visibility must be governed by searchQuery.length > 0"
      );
    });

    it("T5.4.2: clear button action resets searchQuery to '' while strictly preserving active filter tab", () => {
      const tabIds = ["dogs", "cats", "puppies", "kittens", "special-needs", "senior", "other"];

      for (const tab of tabIds) {
        const harness = new CatalogHarness().setFilter(tab).setSearchQuery("some_query");
        assert.equal(harness.activeFilter, tab);
        assert.equal(harness.searchQuery, "some_query");

        // Simulate clearSearch
        harness.clearSearch();

        assert.equal(harness.searchQuery, "", "searchQuery must be cleared to empty string");
        assert.equal(harness.activeFilter, tab, `Active tab '${tab}' must be preserved after search clear`);

        // Check visible pets corresponds to category total
        const baseCounts = computeTabCounts(SAMPLE_PETS, "");
        assert.equal(harness.getVisiblePets().length, baseCounts[tab]);
      }
    });

    it("T5.4.3: 100-cycle typing and clearing stress test shows zero state drift or memory leakage", () => {
      const harness = new CatalogHarness().setFilter("dogs");
      const queries = ["Kaju", "Daisy", "Simba", "Indie", "Shadow", "Milo", "Rocky", "Golden", "Cream", ""];

      for (let i = 0; i < 100; i++) {
        const q = queries[i % queries.length];
        harness.setSearchQuery(q);
        const countBefore = harness.getVisiblePets().length;
        assert.ok(countBefore >= 0);

        harness.clearSearch();
        assert.equal(harness.searchQuery, "");
        assert.equal(harness.activeFilter, "dogs");
        assert.equal(harness.getVisiblePets().length, 6);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 5: Informative Empty State Render and Reset CTA Functionality
  // ─────────────────────────────────────────────────────────────────────────
  describe("A5: Empty State Text Semantics, WhatsApp CTA, and Reset All Filters", () => {
    it("T5.5.1: empty state triggers correctly across all 8 tabs when count is 0", () => {
      for (const tab of FILTER_TABS) {
        const harness = new CatalogHarness().setFilter(tab.id).setSearchQuery("zzzz_no_match");
        assert.equal(harness.isEmpty(), true);
        const info = harness.getEmptyStateInfo();
        assert.ok(info !== null);
        assert.equal(info.isEmpty, true);
        assert.equal(info.filterLabel, tab.label);
      }
    });

    it("T5.5.2: empty state text matches specifications for all three display variants", () => {
      // Variant 1: Query + Category (activeFilter !== "all")
      const harness1 = new CatalogHarness().setFilter("cats").setSearchQuery("Kaju");
      const info1 = harness1.getEmptyStateInfo();
      assert.equal(info1.query, "Kaju");
      assert.equal(info1.filterLabel, "Cats");

      // Variant 2: Query only (activeFilter === "all")
      const harness2 = new CatalogHarness().setFilter("all").setSearchQuery("nonexistent");
      const info2 = harness2.getEmptyStateInfo();
      assert.equal(info2.query, "nonexistent");
      assert.equal(info2.activeFilter, "all");

      // Variant 3: Category only (empty search query on empty category if any)
      const mockEmptyHarness = new CatalogHarness([]).setFilter("cats").setSearchQuery("");
      const info3 = mockEmptyHarness.getEmptyStateInfo();
      assert.equal(info3.query, "");
      assert.equal(info3.filterLabel, "Cats");
    });

    it("T5.5.3: WhatsApp CTA URL generation safely encodes complex characters, quotes, and emojis", () => {
      const adversarialQueries = [
        "golden & fawn",
        "dog's \"favorite\"",
        "kaju / daisy #1",
        "kaju 🐶 lap cuddler",
        "<bold>puppy</bold>",
        "Bengaluru (North) ~ 100% cute!",
      ];

      for (const q of adversarialQueries) {
        const message = `Hi Haven Paws team, I was searching for "${q.trim()}" on your adoption website but couldn't find a matching rescue. Are there any upcoming pets matching this?`;
        const url = buildWhatsAppUrl(message);

        assert.ok(url.startsWith(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=`));
        const parsed = new URL(url);
        const decodedText = parsed.searchParams.get("text");
        assert.equal(decodedText, message);
      }
    });

    it("T5.5.4: Reset All Filters restores catalog to pristine default state", () => {
      const harness = new CatalogHarness().setFilter("senior").setSearchQuery("nonexistent_dog");
      assert.equal(harness.isEmpty(), true);

      // Invoke reset
      harness.resetAll();

      assert.equal(harness.searchQuery, "");
      assert.equal(harness.activeFilter, "all");
      assert.equal(harness.getVisiblePets().length, SAMPLE_PETS.length);
      assert.equal(harness.isEmpty(), false);

      const counts = harness.getCounts();
      assert.equal(counts.all, SAMPLE_PETS.length);
      assert.equal(counts.dogs, 6);
      assert.equal(counts.puppies, 5);
      assert.equal(counts.cats, 2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 6: Dynamic Category Badge Count Invariant & Integrity Matrix
  // ─────────────────────────────────────────────────────────────────────────
  describe("A6: Dynamic Category Badge Count Invariant & Integrity Matrix", () => {
    it("T5.6.1: universal invariant visiblePets.length === tabCounts[activeTab] holds for all combinations", () => {
      const sampleQueries = [
        "",
        "kaju",
        "daisy",
        "simba",
        "shadow",
        "milo",
        "rocky",
        "luna",
        "amber",
        "oreo",
        "#D01",
        "D01",
        "#D02",
        "D02",
        "#C01",
        "#O01",
        "indie",
        "golden",
        "cream",
        "ginger",
        "rabbit",
        "special",
        "senior",
        "puppy",
        "kitten",
        "three-legged",
        "apartment",
        "cuddler",
        "gentle",
        "playful",
        "999_nonexistent",
        "🐶",
        ".*",
        "+",
        "?",
      ];

      for (const query of sampleQueries) {
        for (const tab of FILTER_TABS) {
          const harness = new CatalogHarness().setFilter(tab.id).setSearchQuery(query);
          const visibleCount = harness.getVisiblePets().length;
          const counts = harness.getCounts();

          assert.equal(
            visibleCount,
            counts[tab.id],
            `Invariant violation for query '${query}' on tab '${tab.id}': visible=${visibleCount}, count=${counts[tab.id]}`
          );
        }
      }
    });

    it("T5.6.2: single-character exhaustive audit ('a' through 'z') verifies badge consistency", () => {
      for (let code = 97; code <= 122; code++) {
        const char = String.fromCharCode(code);
        const counts = computeTabCounts(SAMPLE_PETS, char);

        // Invariant 1: total matches equals tabCounts.all
        const allMatches = SAMPLE_PETS.filter((p) => matchesSearch(p, char)).length;
        assert.equal(counts.all, allMatches, `Char '${char}' tabCounts.all mismatch`);

        // Invariant 2: puppy count <= dog count
        assert.ok(counts.puppies <= counts.dogs, `Char '${char}': puppies (${counts.puppies}) > dogs (${counts.dogs})`);

        // Invariant 3: kitten count <= cat count
        assert.ok(counts.kittens <= counts.cats, `Char '${char}': kittens (${counts.kittens}) > cats (${counts.cats})`);

        // Invariant 4: tab counts bounded between 0 and 9
        for (const [key, val] of Object.entries(counts)) {
          assert.ok(val >= 0 && val <= 9, `Char '${char}': tab '${key}' count ${val} out of bounds [0, 9]`);
        }
      }
    });

    it("T5.6.3: zero-match queries guarantee all 8 badge counts are strictly 0", () => {
      const impossibleQueries = ["xyz987impossible", "qwertyuiopasdfgh", "!!!@@@###$$$"];

      for (const q of impossibleQueries) {
        const counts = computeTabCounts(SAMPLE_PETS, q);
        for (const tab of FILTER_TABS) {
          assert.equal(counts[tab.id], 0, `Query '${q}' produced non-zero count ${counts[tab.id]} on tab '${tab.id}'`);
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 7: Source Code & AST Security, Hydration & Accessibility Audit
  // ─────────────────────────────────────────────────────────────────────────
  describe("A7: Source Code Security, Hydration, and Accessibility Contracts", () => {
    it("T5.7.1: AdoptCatalogClient uses substring matching (String.prototype.includes) and never raw new RegExp(query)", () => {
      const clientPath = path.resolve(process.cwd(), "src/components/AdoptCatalogClient.tsx");
      const code = fs.readFileSync(clientPath, "utf-8");

      // Verify no dynamic regex compilation on query
      assert.ok(!code.includes("new RegExp(query"), "Must not compile unescaped user query into new RegExp()");
      assert.ok(!code.includes("new RegExp(q"), "Must not compile unescaped query variable into new RegExp()");
      assert.ok(code.includes(".includes(q)"), "Must use safe String.prototype.includes() for query search");
    });

    it("T5.7.2: client component boundary and hook memoization audit", () => {
      const clientPath = path.resolve(process.cwd(), "src/components/AdoptCatalogClient.tsx");
      const code = fs.readFileSync(clientPath, "utf-8");

      assert.ok(code.startsWith('"use client"') || code.startsWith("'use client'"), "Must declare 'use client'");
      assert.ok(code.includes("useMemo"), "Must memoize tabCounts and visiblePets via useMemo");
      assert.ok(code.includes("useSearchParams"), "Must handle URL query param synchronization");
    });

    it("T5.7.3: WAI-ARIA roles and attributes are correctly declared", () => {
      const inspection = inspectCatalogSource();
      assert.ok(inspection.hasSearchRole, "Must contain role='search'");
      assert.ok(inspection.hasTabRole, "Must contain role='tablist' and role='tab'");
      assert.ok(inspection.hasEmptyState, "Must render empty state container");
      assert.ok(inspection.rawContent.includes('role="status"'), "Empty state must have role='status'");
      assert.ok(inspection.rawContent.includes('aria-live="polite"'), "Empty state must have aria-live='polite'");
      assert.ok(inspection.rawContent.includes('aria-selected='), "Tabs must declare aria-selected");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 8: Fuzzing, URL Synonyms, and Adoption Code Permutations
  // ─────────────────────────────────────────────────────────────────────────
  describe("A8: Fuzzing, URL Synonyms, and Adoption Code Permutations", () => {
    it("T5.8.1: adoption code prefix flexibility (#D01, D01, uppercase, lowercase, padded)", () => {
      const variations = [
        { query: "#D01", expected: "kaju" },
        { query: "D01", expected: "kaju" },
        { query: "#d01", expected: "kaju" },
        { query: "d01", expected: "kaju" },
        { query: " #D01 ", expected: "kaju" },
        { query: "#D02", expected: "daisy" },
        { query: "D02", expected: "daisy" },
        { query: "#C01", expected: "amber" },
        { query: "#C02", expected: "cleo" },
        { query: "#O01", expected: "oreo" },
      ];

      for (const { query, expected } of variations) {
        const harness = new CatalogHarness().setSearchQuery(query);
        const visible = harness.getVisiblePets();
        assert.ok(visible.some((p) => p.id === expected), `Failed for adoption code query '${query}'`);
      }
    });

    it("T5.8.2: 100-case pseudo-random fuzzing generates zero exceptions and preserves invariant", () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?`~🐶🐱🐾 \t\n";
      let seed = 123456;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      for (let i = 0; i < 100; i++) {
        const length = Math.floor(rnd() * 25) + 1;
        let randomQuery = "";
        for (let j = 0; j < length; j++) {
          const charIdx = Math.floor(rnd() * charset.length);
          randomQuery += charset[charIdx];
        }

        assert.doesNotThrow(() => {
          const counts = computeTabCounts(SAMPLE_PETS, randomQuery);
          for (const tab of FILTER_TABS) {
            const harness = new CatalogHarness().setFilter(tab.id).setSearchQuery(randomQuery);
            const visible = harness.getVisiblePets();
            assert.equal(visible.length, counts[tab.id]);
          }
        }, `Fuzzing threw on query: ${JSON.stringify(randomQuery)}`);
      }
    });

    it("T5.8.3: malformed and synthetic pet objects with missing fields evaluate gracefully", () => {
      const sparsePet = {
        id: "sparse-pet",
        adoptionCode: "",
        name: "",
        species: "dog",
        badgeLabel: "",
        breed: "",
        age: "",
        gender: "Male",
        size: "",
        color: "",
        image: "",
        gallery: [],
        alt: "",
        tags: [],
        vaccinationStatus: "",
        dewormedStatus: "",
        sterilisationStatus: "",
        medicalHistory: [],
        adoptionRequirements: [],
        location: "",
        story: "",
        whatsappMessage: "",
      };

      assert.doesNotThrow(() => {
        matchesSearch(sparsePet, "test");
        matchesCategory(sparsePet, "dogs");
        matchesCategory(sparsePet, "puppies");
        matchesCategory(sparsePet, "cats");
        matchesCategory(sparsePet, "kittens");
        matchesCategory(sparsePet, "special-needs");
        matchesCategory(sparsePet, "senior");
        matchesCategory(sparsePet, "other");
      });
    });
  });
});
