import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SAMPLE_PETS } from "../src/data/pets.ts";
import { buildWhatsAppUrl, SITE_CONFIG } from "../src/config/site.ts";
import { REQUIRED_TOKENS, auditCoreTokens } from "./helpers/css-auditor.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const profileClientPath = path.join(projectRoot, "src", "components", "PetProfileClient.tsx");
const petCardPath = path.join(projectRoot, "src", "components", "PetCard.tsx");
const petModalPath = path.join(projectRoot, "src", "components", "PetModal.tsx");
const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");
const profilePagePath = path.join(projectRoot, "src", "app", "adopt", "[id]", "page.tsx");

const profileClientSource = fs.readFileSync(profileClientPath, "utf-8");
const petCardSource = fs.readFileSync(petCardPath, "utf-8");
const petModalSource = fs.readFileSync(petModalPath, "utf-8");
const globalsCssSource = fs.readFileSync(globalsCssPath, "utf-8");
const profilePageSource = fs.readFileSync(profilePagePath, "utf-8");

describe("Empirical Challenger 2: Client Component & Styling Integration", () => {
  /* ========================================================================
   * SUITE 1: PetProfileClient.tsx Contract & Source Architecture
   * ======================================================================== */
  describe("1. PetProfileClient.tsx Architecture & State Mechanics", () => {
    it("should be declared as a Client Component with 'use client' directive", () => {
      assert.ok(
        profileClientSource.trim().startsWith('"use client"') ||
          profileClientSource.trim().startsWith("'use client'"),
        "PetProfileClient.tsx must start with 'use client' directive"
      );
    });

    it("should import useState and useCallback from react", () => {
      assert.match(
        profileClientSource,
        /import\s+[^;]*\buseState\b[^;]*from\s+["']react["']/,
        "Must import useState from 'react'"
      );
      assert.match(
        profileClientSource,
        /import\s+[^;]*\buseCallback\b[^;]*from\s+["']react["']/,
        "Must import useCallback from 'react'"
      );
    });

    it("should declare galleryImages with robust fallback to [pet.image]", () => {
      // Must check Array.isArray and length > 0 before defaulting to [pet.image]
      assert.match(
        profileClientSource,
        /galleryImages\s*:\s*string\[\]\s*=\s*Array\.isArray\(pet\.gallery\)\s*&&\s*pet\.gallery\.length\s*>\s*0\s*\?\s*pet\.gallery\s*:\s*\[pet\.image\]/,
        "Must normalize galleryImages falling back to [pet.image]"
      );
    });

    it("should simulate galleryImages fallback logic across normal, empty, and malformed pet inputs", () => {
      const normalizeGallery = (pet) =>
        Array.isArray(pet.gallery) && pet.gallery.length > 0 ? pet.gallery : [pet.image];

      // Standard pet with 3 gallery images
      const kaju = SAMPLE_PETS.find((p) => p.id === "kaju");
      assert.ok(kaju);
      assert.deepEqual(normalizeGallery(kaju), kaju.gallery);
      assert.equal(normalizeGallery(kaju).length, 3);

      // Edge case: pet with empty gallery array
      const petWithEmptyGallery = { image: "/images/1.jpeg", gallery: [] };
      assert.deepEqual(normalizeGallery(petWithEmptyGallery), ["/images/1.jpeg"]);

      // Edge case: pet with undefined gallery
      const petWithUndefinedGallery = { image: "/images/2.jpeg" };
      assert.deepEqual(normalizeGallery(petWithUndefinedGallery), ["/images/2.jpeg"]);

      // Edge case: pet with null gallery
      const petWithNullGallery = { image: "/images/3.jpeg", gallery: null };
      assert.deepEqual(normalizeGallery(petWithNullGallery), ["/images/3.jpeg"]);

      // Edge case: pet with invalid non-array gallery (e.g. string or object)
      const petWithInvalidGallery = { image: "/images/4.jpeg", gallery: "not-an-array" };
      assert.deepEqual(normalizeGallery(petWithInvalidGallery), ["/images/4.jpeg"]);
    });

    it("should implement mathematically sound cycle logic for prev and next navigation", () => {
      // Logic from PetProfileClient.tsx:
      // prev: (prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1)
      // next: (prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0)

      const prevStep = (curr, len) => (curr > 0 ? curr - 1 : len - 1);
      const nextStep = (curr, len) => (curr < len - 1 ? curr + 1 : 0);

      // Verify across gallery lengths 1, 2, 3, 5, 9
      for (const len of [1, 2, 3, 5, 9]) {
        // Forward full loop
        let current = 0;
        for (let i = 0; i < len; i++) {
          assert.equal(current, i, `Forward loop at step ${i} for len ${len}`);
          current = nextStep(current, len);
        }
        assert.equal(current, 0, `Forward loop should wrap to 0 after ${len} steps`);

        // Backward full loop
        current = 0;
        current = prevStep(current, len);
        assert.equal(current, len - 1, `Previous from index 0 should wrap to last index (${len - 1})`);
        for (let i = len - 1; i > 0; i--) {
          current = prevStep(current, len);
          assert.equal(current, i - 1, `Backward loop step for len ${len}`);
        }
        assert.equal(current, 0, `Backward loop should return to index 0`);
      }

      // Adversarial test: 1000 random forward and backward steps stay within bounds [0, len - 1]
      const galleryLen = 3;
      let pos = 0;
      for (let step = 0; step < 1000; step++) {
        const goForward = step % 3 !== 0;
        pos = goForward ? nextStep(pos, galleryLen) : prevStep(pos, galleryLen);
        assert.ok(pos >= 0 && pos < galleryLen, `Position ${pos} must be within [0, ${galleryLen - 1}]`);
      }
    });

    it("should render thumbnail strip with accessible tablist/tab roles and active styling indicator", () => {
      assert.match(
        profileClientSource,
        /role="tablist"/,
        "Thumbnail strip container must have role='tablist'"
      );
      assert.match(
        profileClientSource,
        /role="tab"/,
        "Thumbnail buttons must have role='tab'"
      );
      assert.match(
        profileClientSource,
        /aria-selected=\{isActive\}/,
        "Thumbnail buttons must bind aria-selected to isActive boolean"
      );
      assert.match(
        profileClientSource,
        /className=\{`profile-thumb-btn\s*\$\{\s*isActive\s*\?\s*"active"\s*:\s*""\s*\}`\}/,
        "Thumbnail button must apply 'active' class when isActive is true"
      );
      assert.match(
        profileClientSource,
        /aria-label=\{`View photo \$\{idx \+ 1\} of \$\{pet\.name\}`\}/,
        "Thumbnail button must have informative aria-label"
      );
    });

    it("should guard multi-photo controls when pet has only 1 image", () => {
      // Photo counter, cycle buttons, and thumbnail strip should only render when galleryImages.length > 1
      assert.match(
        profileClientSource,
        /galleryImages\.length\s*>\s*1\s*&&\s*\(\s*<span className="profile-hero-counter"/,
        "Photo counter must be conditional on galleryImages.length > 1"
      );
      assert.match(
        profileClientSource,
        /galleryImages\.length\s*>\s*1\s*&&\s*\(\s*<>\s*<button[^>]*className="gallery-nav-btn prev"/,
        "Cycle buttons must be conditional on galleryImages.length > 1"
      );
      assert.match(
        profileClientSource,
        /galleryImages\.length\s*>\s*1\s*&&\s*\(\s*<div\s+className="profile-thumbnails"/,
        "Thumbnail strip must be conditional on galleryImages.length > 1"
      );
    });

    it("should include visible Pet ID badge with pet.adoptionCode", () => {
      assert.match(
        profileClientSource,
        /<span\s+className="profile-id-badge"[^>]*>\s*\{pet\.adoptionCode\}\s*<\/span>/,
        "Must render visible Pet ID badge displaying pet.adoptionCode"
      );
    });

    it("should render vitals grid with all 6 required pet vitals", () => {
      const requiredVitals = [
        { label: "Age", prop: "pet.age" },
        { label: "Breed", prop: "pet.breed" },
        { label: "Gender", prop: "pet.gender" },
        { label: "Size", prop: "pet.size" },
        { label: "Coat Color", prop: "pet.color" },
        { label: "Location", prop: "pet.location" },
      ];

      assert.match(
        profileClientSource,
        /<div className="profile-vitals-grid">/,
        "Must contain .profile-vitals-grid container"
      );

      for (const vital of requiredVitals) {
        const labelRegex = new RegExp(`<span className="vital-label">${vital.label}</span>`);
        const valueRegex = new RegExp(`<strong className="vital-value">\\{${vital.prop.replace(".", "\\.")}\\}</strong>`);
        assert.match(
          profileClientSource,
          labelRegex,
          `Vitals grid must contain vital label '${vital.label}'`
        );
        assert.match(
          profileClientSource,
          valueRegex,
          `Vitals grid must bind '${vital.label}' to '${vital.prop}'`
        );
      }
    });

    it("should render personality tags and guard against empty/null tags", () => {
      assert.match(
        profileClientSource,
        /\{pet\.tags\s*&&\s*pet\.tags\.length\s*>\s*0\s*&&/,
        "Must guard pet.tags existence before rendering"
      );
      assert.match(
        profileClientSource,
        /className="profile-tag"/,
        "Must render tag pill with .profile-tag"
      );
    });

    it("should render all 3 preventive health badges (vaccination, dewormed, sterilisation)", () => {
      assert.match(
        profileClientSource,
        /<span className="health-title">Vaccination<\/span>[\s\S]*?<p className="health-val">\{pet\.vaccinationStatus\}<\/p>/,
        "Must render vaccination status"
      );
      assert.match(
        profileClientSource,
        /<span className="health-title">Dewormed<\/span>[\s\S]*?<p className="health-val">\{pet\.dewormedStatus\}<\/p>/,
        "Must render dewormed status"
      );
      assert.match(
        profileClientSource,
        /<span className="health-title">Sterilisation<\/span>[\s\S]*?<p className="health-val">\{pet\.sterilisationStatus\}<\/p>/,
        "Must render sterilisation status"
      );
    });

    it("should render clinical timeline (medicalHistory) with fallback empty state", () => {
      assert.match(
        profileClientSource,
        /pet\.medicalHistory\s*&&\s*pet\.medicalHistory\.length\s*>\s*0\s*\?/,
        "Must check medicalHistory existence and length"
      );
      assert.match(
        profileClientSource,
        /<ul className="profile-timeline-list">/,
        "Must render .profile-timeline-list"
      );
      assert.match(
        profileClientSource,
        /<li key=\{idx\} className="timeline-item">/,
        "Must render timeline items"
      );
      assert.match(
        profileClientSource,
        /<p className="timeline-empty">/,
        "Must provide empty state when medicalHistory is absent"
      );
    });

    it("should render adoption requirements with checkmarks and fallback empty state", () => {
      assert.match(
        profileClientSource,
        /pet\.adoptionRequirements\s*&&\s*pet\.adoptionRequirements\.length\s*>\s*0\s*\?/,
        "Must check adoptionRequirements existence and length"
      );
      assert.match(
        profileClientSource,
        /<ul className="profile-requirements-list">/,
        "Must render .profile-requirements-list"
      );
      assert.match(
        profileClientSource,
        /<li key=\{idx\} className="requirement-item">/,
        "Must render requirement items"
      );
      assert.match(
        profileClientSource,
        /<p className="requirements-empty">/,
        "Must provide empty state when adoptionRequirements is absent"
      );
    });

    it("should render rescue backstory narrative guarded by pet.story", () => {
      assert.match(
        profileClientSource,
        /\{pet\.story\s*&&/,
        "Rescue backstory section must guard on pet.story existence"
      );
      assert.match(
        profileClientSource,
        /<p className="profile-story-text">\{pet\.story\}<\/p>/,
        "Must render pet.story inside .profile-story-text"
      );
    });

    it("should implement robust Web Share API with clipboard fallback", () => {
      // Must check SSR guard: typeof window === "undefined"
      assert.match(
        profileClientSource,
        /if\s*\(\s*typeof\s+window\s*===\s*["']undefined["']\s*\)\s*return;/,
        "handleShare must be SSR-safe"
      );

      // Must check navigator.share && navigator.canShare
      assert.match(
        profileClientSource,
        /navigator\.share\s*&&\s*navigator\.canShare\s*&&\s*navigator\.canShare\(shareData\)/,
        "Must feature-detect navigator.share and validate shareData via canShare"
      );

      // Must catch and fall back to navigator.clipboard.writeText
      assert.match(
        profileClientSource,
        /navigator\.clipboard\.writeText\(window\.location\.href\)/,
        "Must fall back to clipboard writeText"
      );

      // Must toggle copied state with auto-reset timer
      assert.match(
        profileClientSource,
        /setCopied\(true\);[\s\S]*?setTimeout\(\s*\(\)\s*=>\s*setCopied\(false\),\s*2500\);/,
        "Must setCopied(true) and reset after timeout"
      );
    });

    it("should ensure all interactive buttons explicitly specify type='button' to prevent accidental form submits", () => {
      const buttonMatches = [...profileClientSource.matchAll(/<button\b([^>]*)>/g)];
      assert.ok(buttonMatches.length >= 4, `Expected at least 4 buttons in PetProfileClient, found ${buttonMatches.length}`);
      for (const [fullTag, attrs] of buttonMatches) {
        assert.match(
          attrs,
          /type="button"/,
          `Button tag must explicitly declare type="button" to prevent accidental form submission: ${fullTag}`
        );
      }
    });

    it("should ensure all external WhatsApp links declare rel='noopener noreferrer' and target='_blank'", () => {
      const sources = [
        { name: "PetProfileClient.tsx", content: profileClientSource },
        { name: "PetCard.tsx", content: petCardSource },
        { name: "PetModal.tsx", content: petModalSource },
      ];

      for (const src of sources) {
        const anchorMatches = [...src.content.matchAll(/<a\b([^>]*)href=\{[^}]*whatsApp[^}]*\}([^>]*)>/gi)];
        for (const [fullTag, attrBefore, attrAfter] of anchorMatches) {
          const combinedAttrs = `${attrBefore} ${attrAfter}`;
          assert.match(
            combinedAttrs,
            /target="_blank"/,
            `WhatsApp link in ${src.name} must have target="_blank": ${fullTag}`
          );
          assert.match(
            combinedAttrs,
            /rel="noopener noreferrer"/,
            `WhatsApp link in ${src.name} must have rel="noopener noreferrer": ${fullTag}`
          );
        }
      }
    });
  });

  /* ========================================================================
   * SUITE 2: WhatsApp URL Generation & Encoding Rigor
   * ======================================================================== */
  describe("2. WhatsApp Inquiry URL Generation & Encoding Rigor", () => {
    it("should invoke buildWhatsAppUrl for inquiry CTA in PetProfileClient", () => {
      assert.match(
        profileClientSource,
        /const\s+whatsAppInquiryUrl\s*=\s*buildWhatsAppUrl\(inquiryMessage\);/,
        "PetProfileClient must invoke buildWhatsAppUrl(inquiryMessage)"
      );
      assert.match(
        profileClientSource,
        /<a\s+href=\{whatsAppInquiryUrl\}\s+target="_blank"\s+rel="noopener noreferrer"\s+className="btn-wa-profile"/,
        "CTA link must bind href to whatsAppInquiryUrl with secure target and rel attributes"
      );
    });

    it("should generate valid WhatsApp URLs for all 9 companions containing pet name and Pet ID", () => {
      for (const pet of SAMPLE_PETS) {
        const inquiryMessage =
          pet.whatsappMessage ||
          `Hi ${SITE_CONFIG.brandName} team, I fell in love with ${pet.name} (${pet.adoptionCode}) on your adoption website! Can we schedule a visit to meet?`;

        const waUrl = buildWhatsAppUrl(inquiryMessage);

        // URL structure checks
        assert.ok(waUrl.startsWith("https://wa.me/"), `Must start with https://wa.me/ for pet ${pet.id}`);
        assert.ok(waUrl.includes("918630438778"), `Must target official Haven Paws phone number for ${pet.id}`);
        assert.ok(waUrl.includes("?text="), `Must contain ?text= parameter for ${pet.id}`);

        // Verify URL parseability
        const parsed = new URL(waUrl);
        assert.equal(parsed.protocol, "https:");
        assert.equal(parsed.hostname, "wa.me");
        assert.equal(parsed.pathname, "/918630438778");

        const textParam = parsed.searchParams.get("text");
        assert.ok(textParam, `text search param must not be empty for ${pet.id}`);

        // Name and Pet ID presence in decoded text
        assert.ok(
          textParam.includes(pet.name),
          `Decoded text must include pet name '${pet.name}' for ${pet.id}: got '${textParam}'`
        );
        assert.ok(
          textParam.includes(pet.adoptionCode),
          `Decoded text must include adoption code '${pet.adoptionCode}' for ${pet.id}: got '${textParam}'`
        );

        // Verify that adoptionCode's '#' was encoded as '%23' in the raw URL so it doesn't break into an HTTP fragment
        const encodedAdoptionCode = encodeURIComponent(pet.adoptionCode);
        assert.ok(
          waUrl.includes(encodedAdoptionCode),
          `Raw URL must contain encoded code '${encodedAdoptionCode}' rather than raw '#' fragment for ${pet.id}`
        );
      }
    });

    it("should adversarially test buildWhatsAppUrl against hostile strings without breaking URL syntax", () => {
      const hostileCases = [
        {
          name: "Quotes and special punctuation",
          input: 'Hi "Haven Paws", let\'s meet pet #D99 & talk about fees / terms!',
        },
        {
          name: "Unicode and emojis",
          input: "🐶 Adopt Max #D88 🐾 Bangalore! 💖",
        },
        {
          name: "URL control characters (&, =, ?, #, %, +)",
          input: "Check code #D01?param=1&foo=bar+baz%20100%",
        },
        {
          name: "Multi-line with carriage returns and line feeds",
          input: "Line 1: Hello\nLine 2: Pet #C99\r\nLine 3: Goodbye",
        },
      ];

      for (const tc of hostileCases) {
        const url = buildWhatsAppUrl(tc.input);
        assert.doesNotThrow(() => new URL(url), `URL must be parseable for case: ${tc.name}`);
        const parsed = new URL(url);
        const decoded = parsed.searchParams.get("text");
        assert.equal(decoded, tc.input, `Round-trip decoding must match original input for case: ${tc.name}`);
        // Ensure no unencoded '#' exists before hash fragment
        const queryPart = url.split("?")[1] || "";
        assert.ok(!queryPart.includes("#"), `Query part should not contain raw unencoded '#' for case: ${tc.name}`);
      }
    });
  });

  /* ========================================================================
   * SUITE 3: Catalog & Modal Link Updates (PetCard.tsx & PetModal.tsx)
   * ======================================================================== */
  describe("3. Catalog & Modal Link Updates (PetCard.tsx & PetModal.tsx)", () => {
    it("PetCard.tsx: should link card title to /adopt/[id]", () => {
      assert.match(
        petCardSource,
        /<h4 className="pet-name">\s*<Link href=\{`\/adopt\/\$\{pet\.id\}`\}>\{pet\.name\}<\/Link>\s*<\/h4>/,
        "PetCard must link pet name to `/adopt/${pet.id}`"
      );
    });

    it("PetCard.tsx: should provide 'Profile' action button linking to /adopt/[id]", () => {
      assert.match(
        petCardSource,
        /<Link href=\{`\/adopt\/\$\{pet\.id\}`\} className="btn-card-view">\s*Profile\s*<\/Link>/,
        "PetCard must render `<Link href={`/adopt/${pet.id}`} className=\"btn-card-view\">Profile</Link>`"
      );
    });

    it("PetCard.tsx: should render visible Pet ID badge (.pet-card-id)", () => {
      assert.match(
        petCardSource,
        /<span className="pet-card-id">\{pet\.adoptionCode\}<\/span>/,
        "PetCard must display adoptionCode in .pet-card-id"
      );
    });

    it("PetCard.tsx: should render badge-species other for species 'other'", () => {
      assert.match(
        petCardSource,
        /pet\.species === "other"\s*\?\s*"badge-species other"/,
        "PetCard must assign 'badge-species other' when pet.species === 'other'"
      );

      // Verify for Oreo
      const oreo = SAMPLE_PETS.find((p) => p.id === "oreo");
      assert.ok(oreo);
      assert.equal(oreo.species, "other");

      const getSpeciesClass = (species) =>
        species === "cat" ? "badge-species cat" : species === "other" ? "badge-species other" : "badge-species";

      assert.equal(getSpeciesClass(oreo.species), "badge-species other");
      assert.equal(getSpeciesClass("dog"), "badge-species");
      assert.equal(getSpeciesClass("cat"), "badge-species cat");
    });

    it("PetCard.tsx: onViewProfile prop must be optional and backwards compatible", () => {
      assert.match(
        petCardSource,
        /onViewProfile\?\s*:\s*\(pet:\s*PetProfile\)\s*=>\s*void/,
        "onViewProfile must be typed as optional"
      );
      assert.match(
        petCardSource,
        /onClick=\{\(\)\s*=>\s*onViewProfile\?\.(\(pet\))\}/,
        "onViewProfile invocation must use optional chaining (?.)"
      );
    });

    it("PetModal.tsx: should render 'View Full Profile Page →' linking to /adopt/[id]", () => {
      assert.match(
        petModalSource,
        /<Link\s+href=\{`\/adopt\/\$\{pet\.id\}`\}\s+onClick=\{onClose\}\s+className="btn-secondary"[^>]*>\s*View Full Profile Page →\s*<\/Link>/,
        "PetModal must contain View Full Profile Page link invoking onClose and pointing to `/adopt/${pet.id}`"
      );
    });

    it("PetModal.tsx: should cleanly handle species 'other' without mislabeling as 'Cat'", () => {
      // Must not use binary ternary that defaults everything non-dog to Cat!
      assert.match(
        petModalSource,
        /const\s+speciesLabel\s*=\s*pet\.species\s*===\s*["']dog["']\s*\?\s*["']Dog["']\s*:\s*pet\.species\s*===\s*["']cat["']\s*\?\s*["']Cat["']\s*:\s*pet\.badgeLabel\s*\|\|\s*["']Other Animal["'];/,
        "PetModal must cleanly handle species other using badgeLabel fallback"
      );

      const getSpeciesLabel = (pet) =>
        pet.species === "dog"
          ? "Dog"
          : pet.species === "cat"
          ? "Cat"
          : pet.badgeLabel || "Other Animal";

      // Test with all 9 pets
      for (const pet of SAMPLE_PETS) {
        const label = getSpeciesLabel(pet);
        if (pet.species === "dog") {
          assert.equal(label, "Dog", `Expected 'Dog' for ${pet.id}`);
        } else if (pet.species === "cat") {
          assert.equal(label, "Cat", `Expected 'Cat' for ${pet.id}`);
        } else if (pet.species === "other") {
          assert.notEqual(label, "Cat", `Oreo/other animal ${pet.id} must NOT be labeled 'Cat'`);
          assert.equal(label, pet.badgeLabel || "Other Animal");
        }
      }

      // Adversarial test: other animal without badgeLabel
      const anonymousOther = { species: "other", badgeLabel: "" };
      assert.equal(getSpeciesLabel(anonymousOther), "Other Animal");
    });
  });

  /* ========================================================================
   * SUITE 4: CSS Tokens, Layout & Responsive Rules
   * ======================================================================== */
  describe("4. CSS Tokens & Responsive Layout Rules in globals.css", () => {
    it("should preserve 100% of the 5 core :root color tokens exactly", () => {
      const audit = auditCoreTokens(globalsCssPath);
      assert.ok(audit.allValid, "All 5 core color tokens must be intact in globals.css");

      const expected = {
        "--bg-canvas": "#FAF7F2",
        "--text-main": "#2B2523",
        "--brand-forest": "#2D5A46",
        "--accent-coral": "#E07A5F",
        "--accent-amber": "#F4A261",
      };

      for (const [token, hex] of Object.entries(expected)) {
        assert.ok(audit.details[token], `Token ${token} must exist in audit results`);
        assert.equal(
          audit.details[token].found,
          hex.toUpperCase(),
          `Token ${token} must equal ${hex}`
        );
        assert.ok(audit.details[token].passed, `Token ${token} validation passed`);
      }
    });

    it("should define .profile-grid desktop 2-column layout (sticky gallery + details)", () => {
      assert.match(
        globalsCssSource,
        /\.profile-grid\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1fr\s+1\.15fr;[^}]*\}/s,
        ".profile-grid must define 2-column desktop grid: 1fr 1.15fr"
      );

      assert.match(
        globalsCssSource,
        /\.profile-gallery-col\s*\{[^}]*position:\s*sticky;[^}]*top:\s*96px;[^}]*\}/s,
        ".profile-gallery-col must have sticky positioning at top: 96px"
      );
    });

    it("should collapse .profile-grid to 1 column in tablet/mobile media query (@media max-width: 960px)", () => {
      const queryIndex = globalsCssSource.indexOf("@media (max-width: 960px)");
      assert.ok(queryIndex !== -1, "Must contain @media (max-width: 960px)");

      const tabletBlock = globalsCssSource.slice(queryIndex);
      assert.match(
        tabletBlock,
        /\.profile-grid\s*\{[^}]*grid-template-columns:\s*1fr;[^}]*\}/s,
        ".profile-grid must collapse to 1fr under @media (max-width: 960px)"
      );

      assert.match(
        tabletBlock,
        /\.profile-gallery-col\s*\{[^}]*position:\s*static;[^}]*\}/s,
        ".profile-gallery-col must reset position to static under @media (max-width: 960px)"
      );
    });

    it("should add 96px padding-bottom on mobile viewports (@media max-width: 640px) to clear floating WhatsApp button", () => {
      const mobileQueryIndex = globalsCssSource.indexOf("@media (max-width: 640px)");
      assert.ok(mobileQueryIndex !== -1, "Must contain @media (max-width: 640px)");

      const mobileBlock = globalsCssSource.slice(mobileQueryIndex);
      assert.match(
        mobileBlock,
        /\.pet-profile-client\s*\{[^}]*padding-bottom:\s*96px;[^}]*\}/s,
        ".pet-profile-client must have padding-bottom: 96px under @media (max-width: 640px)"
      );
    });

    it("should define responsive grid adjustments for vitals and health cards on mobile", () => {
      const mobileQueryIndex = globalsCssSource.indexOf("@media (max-width: 640px)");
      const mobileBlock = globalsCssSource.slice(mobileQueryIndex);

      assert.match(
        mobileBlock,
        /\.profile-vitals-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\);[^}]*\}/s,
        ".profile-vitals-grid must collapse to repeat(2, 1fr) on mobile"
      );

      assert.match(
        mobileBlock,
        /\.health-badges-grid\s*\{[^}]*grid-template-columns:\s*1fr;[^}]*\}/s,
        ".health-badges-grid must collapse to 1fr on mobile"
      );

      assert.match(
        mobileBlock,
        /\.profile-cta-actions\s*\{[^}]*flex-direction:\s*column;[^}]*\}/s,
        ".profile-cta-actions must stack buttons in column on mobile"
      );
    });

    it("should verify dedicated classes for .profile-thumb-btn.active and .badge-species.other", () => {
      assert.match(
        globalsCssSource,
        /\.profile-thumb-btn\.active\s*\{[^}]*border-color:\s*var\(--brand-forest\);[^}]*box-shadow:\s*0\s+0\s+0\s+3px\s+var\(--brand-forest-subtle\);[^}]*\}/s,
        ".profile-thumb-btn.active must have brand-forest border and brand-forest-subtle ring"
      );

      assert.match(
        globalsCssSource,
        /\.badge-species\.other\s*\{[^}]*background:\s*var\(--accent-amber\);[^}]*color:\s*var\(--text-main\);[^}]*\}/s,
        ".badge-species.other must use --accent-amber background and --text-main color"
      );

      assert.match(
        globalsCssSource,
        /\.pet-card-id\s*\{[^}]*font-family:\s*ui-monospace[^}]*\}/s,
        ".pet-card-id must use monospace typography"
      );
    });
  });

  /* ========================================================================
   * SUITE 5: Full Route Integration & Server Component Contract (/adopt/[id])
   * ======================================================================== */
  describe("5. Route Integration & Server Contract (src/app/adopt/[id]/page.tsx)", () => {
    it("should export generateStaticParams covering all 9 companions in SAMPLE_PETS", () => {
      assert.match(
        profilePageSource,
        /export\s+async\s+function\s+generateStaticParams\(\)/,
        "Must export generateStaticParams"
      );
      assert.match(
        profilePageSource,
        /SAMPLE_PETS\.map\(\(pet\)\s*=>\s*\(\{\s*id:\s*pet\.id,?\s*\}\)\)/,
        "generateStaticParams must map over SAMPLE_PETS returning { id: pet.id }"
      );
    });

    it("should unwrap async params using Promise<{ id: string }> per Next.js 15 App Router spec", () => {
      assert.match(
        profilePageSource,
        /params:\s*Promise<\{\s*id:\s*string\s*\}>/,
        "PageProps must declare params as Promise<{ id: string }>"
      );
      assert.match(
        profilePageSource,
        /const\s*\{\s*id\s*\}\s*=\s*await\s+params;/,
        "Must await params before consuming id"
      );
    });

    it("should export generateMetadata generating dynamic title, description, and OpenGraph", () => {
      assert.match(
        profilePageSource,
        /export\s+async\s+function\s+generateMetadata\(/,
        "Must export generateMetadata"
      );
      assert.match(
        profilePageSource,
        /openGraph:\s*\{[\s\S]*?twitter:\s*\{/,
        "generateMetadata must produce openGraph and twitter card metadata"
      );
    });

    it("should call notFound() when companion ID or adoption code is unrecognized", () => {
      assert.match(
        profilePageSource,
        /import\s+[^;]*\bnotFound\b[^;]*from\s+["']next\/navigation["']/,
        "Must import notFound from next/navigation"
      );
      assert.match(
        profilePageSource,
        /if\s*\(!pet\)\s*\{\s*notFound\(\);\s*\}/,
        "Must invoke notFound() when pet is not found"
      );
    });

    it("should render breadcrumbs and back link to /adopt", () => {
      assert.match(
        profilePageSource,
        /<Link\s+href="\/adopt"\s+className="profile-back-link">\s*← Back to Adoption Directory\s*<\/Link>/,
        "Must render back link to /adopt"
      );
      assert.match(
        profilePageSource,
        /<nav aria-label="Breadcrumb" className="profile-breadcrumbs">/,
        "Must render accessible breadcrumbs navigation"
      );
      assert.match(
        profilePageSource,
        /<PetProfileClient\s+pet=\{pet\}\s*\/>/,
        "Must render PetProfileClient component passing pet prop"
      );
    });
  });
});
