/**
 * Tier 5: Adversarial Profile & CSS Tokens Test Suite
 *
 * Comprehensive adversarial coverage hardening for Play Pet Adoption Step 4:
 * - Dynamic route parameter unwrapping, Next.js 15 async contract, and notFound() triggers
 * - Adversarial and malformed route slugs / injection attack resilience
 * - Data completeness across all 9 rescue companions (ID, age, breed, gender, size, color, health, timeline, requirements)
 * - Multi-photo gallery resilience, asset verification, array fallbacks, and carousel cycling bounds
 * - WhatsApp URL construction, phone number validation, text encoding, and decoded integrity
 * - Strict CSS token preservation (#FAF7F2, #2D5A46, #E07A5F, #F4A261, #2B2523)
 * - Responsive layout media queries across Mobile (375-640px), Tablet (960px), and Desktop (1200px+)
 *
 * Runtime: Node.js 24 native test runner (`node --experimental-strip-types tests/tier5-adversarial-profile.test.mjs`)
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SAMPLE_PETS } from "../src/data/pets.ts";
import { SITE_CONFIG, buildWhatsAppUrl } from "../src/config/site.ts";
import { loadAdoptRouteModule } from "./helpers/adopt-route-loader.mjs";
import {
  validateDynamicRouteStructure,
  validateStaticParamsContract,
  validateCompanionSlugs,
  validateNotFoundRoute,
} from "./helpers/route-validator.mjs";
import {
  REQUIRED_TOKENS,
  auditCoreTokens,
  auditMediaQueries,
} from "./helpers/css-auditor.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const routeTsxPath = path.join(projectRoot, "src", "app", "adopt", "[id]", "page.tsx");
const clientTsxPath = path.join(projectRoot, "src", "components", "PetProfileClient.tsx");
const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");
const notFoundTsxPath = path.join(projectRoot, "src", "app", "not-found.tsx");

const routeTsxSource = fs.readFileSync(routeTsxPath, "utf-8");
const clientTsxSource = fs.readFileSync(clientTsxPath, "utf-8");
const globalsCssSource = fs.readFileSync(globalsCssPath, "utf-8");
const notFoundTsxSource = fs.readFileSync(notFoundTsxPath, "utf-8");

describe("Tier 5: Adversarial Profile & CSS Tokens Hardening Suite", () => {
  let routeModule = null;
  let cleanupRoute = null;

  before(async () => {
    const loaded = await loadAdoptRouteModule(projectRoot);
    routeModule = loaded.mod;
    cleanupRoute = loaded.cleanup;
  });

  after(() => {
    if (typeof cleanupRoute === "function") {
      cleanupRoute();
    }
  });

  // =========================================================================
  // SUITE 1: NEXT.JS 15 ASYNC PARAMS & ROUTE ARCHITECTURE
  // =========================================================================
  describe("Suite 1: Next.js 15 Async Params Contract & Route Architecture", () => {
    it("1.1 should pass route-validator helper checks for dynamic route structure", () => {
      const validation = validateDynamicRouteStructure(projectRoot);
      assert.strictEqual(validation.exists, true, "Dynamic route file must exist");
      assert.strictEqual(validation.hasGenerateStaticParams, true, "Must export generateStaticParams");
      assert.strictEqual(validation.hasNotFound, true, "Must implement notFound() trigger");
      assert.strictEqual(validation.hasAsyncParams, true, "Must support async params");
      assert.deepStrictEqual(validation.issues, [], "Must have 0 structural issues");
    });

    it("1.2 should strictly type PageProps with params as Promise<{ id: string }>", () => {
      assert.match(
        routeTsxSource,
        /interface\s+PageProps\s*\{\s*params:\s*Promise<\{[^}]*id:\s*string[^}]*\}>;\s*\}/,
        "PageProps interface must define params strictly as Promise<{ id: string }>"
      );
    });

    it("1.3 PetProfilePage component must await params before usage", () => {
      assert.match(
        routeTsxSource,
        /export\s+default\s+async\s+function\s+PetProfilePage\s*\(\s*\{\s*params\s*\}\s*:\s*PageProps\s*\)/,
        "PetProfilePage must be an async Server Component accepting PageProps"
      );
      assert.match(
        routeTsxSource,
        /const\s*\{\s*id\s*\}\s*=\s*await\s+params\s*;/,
        "Must await params in PetProfilePage"
      );
    });

    it("1.4 generateMetadata must be an async function awaiting params", () => {
      assert.match(
        routeTsxSource,
        /export\s+async\s+function\s+generateMetadata\s*\(\s*\{\s*params\s*,?\s*\}\s*:\s*PageProps\s*\)/,
        "generateMetadata must be an async function accepting PageProps"
      );
      assert.strictEqual(typeof routeModule.generateMetadata, "function");
    });

    it("1.5 generateStaticParams must return all 9 companions with valid id slugs", async () => {
      const staticParams = await routeModule.generateStaticParams();
      assert.ok(Array.isArray(staticParams), "generateStaticParams must return an array");
      assert.strictEqual(staticParams.length, SAMPLE_PETS.length, "Must return exact count of pets");

      const contract = validateStaticParamsContract(SAMPLE_PETS);
      assert.strictEqual(contract.valid, true);
      assert.strictEqual(contract.uniqueCount, SAMPLE_PETS.length);

      const slugsCheck = validateCompanionSlugs(SAMPLE_PETS);
      assert.strictEqual(slugsCheck.allValid, true);
      assert.deepStrictEqual(slugsCheck.issues, []);
    });

    it("1.6 not-found.tsx route must exist, export default component, and link back to /adopt", () => {
      const notFoundValidation = validateNotFoundRoute(projectRoot);
      assert.strictEqual(notFoundValidation.exists, true, "not-found.tsx must exist");
      assert.strictEqual(notFoundValidation.valid, true, "not-found.tsx must satisfy validation contract");
      assert.strictEqual(notFoundValidation.hasAdoptLink, true, "Must have link to /adopt");
    });
  });

  // =========================================================================
  // SUITE 2: ADVERSARIAL ROUTE LOOKUPS & notFound() RESILIENCE
  // =========================================================================
  describe("Suite 2: Adversarial Route Lookups & notFound() Resilience", () => {
    it("2.1 should resolve all 9 pets by exact lowercase slug via getPetByIdOrCode", () => {
      for (const pet of SAMPLE_PETS) {
        const resolved = routeModule.getPetByIdOrCode(pet.id);
        assert.ok(resolved, `Failed to resolve pet by id: ${pet.id}`);
        assert.strictEqual(resolved.id, pet.id);
        assert.strictEqual(resolved.adoptionCode, pet.adoptionCode);
      }
    });

    it("2.2 should resolve pets case-insensitively across uppercase and mixed-case slugs", () => {
      for (const pet of SAMPLE_PETS) {
        const upper = routeModule.getPetByIdOrCode(pet.id.toUpperCase());
        assert.ok(upper, `Failed uppercase resolution for ${pet.id}`);
        assert.strictEqual(upper.id, pet.id);

        const mixed = routeModule.getPetByIdOrCode(
          pet.id
            .split("")
            .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
            .join("")
        );
        assert.ok(mixed, `Failed mixed-case resolution for ${pet.id}`);
        assert.strictEqual(mixed.id, pet.id);
      }
    });

    it("2.3 should resolve pets by canonical adoption code (#D01, #C01, #O01, etc.)", () => {
      for (const pet of SAMPLE_PETS) {
        const byCode = routeModule.getPetByIdOrCode(pet.adoptionCode);
        assert.ok(byCode, `Failed to resolve by canonical code: ${pet.adoptionCode}`);
        assert.strictEqual(byCode.id, pet.id);

        const lowerCode = routeModule.getPetByIdOrCode(pet.adoptionCode.toLowerCase());
        assert.ok(lowerCode, `Failed to resolve by lowercase code: ${pet.adoptionCode.toLowerCase()}`);
        assert.strictEqual(lowerCode.id, pet.id);
      }
    });

    it("2.4 should resolve pets by raw code without leading hash (D01, d01, O01, c02)", () => {
      for (const pet of SAMPLE_PETS) {
        const clean = pet.adoptionCode.replace(/^#/, "");
        const byClean = routeModule.getPetByIdOrCode(clean);
        assert.ok(byClean, `Failed to resolve by clean code: ${clean}`);
        assert.strictEqual(byClean.id, pet.id);

        const byCleanLower = routeModule.getPetByIdOrCode(clean.toLowerCase());
        assert.ok(byCleanLower, `Failed to resolve by clean lowercase code: ${clean.toLowerCase()}`);
        assert.strictEqual(byCleanLower.id, pet.id);
      }
    });

    it("2.5 should resolve pets with URL-encoded hash prefix (%23D01, %23c01)", () => {
      for (const pet of SAMPLE_PETS) {
        const encodedCode = encodeURIComponent(pet.adoptionCode);
        const resolved = routeModule.getPetByIdOrCode(encodedCode);
        assert.ok(resolved, `Failed to resolve encoded code: ${encodedCode}`);
        assert.strictEqual(resolved.id, pet.id);
      }
    });

    it("2.6 should tolerate leading and trailing whitespace in slug or code", () => {
      for (const pet of SAMPLE_PETS) {
        const paddedSlug = `   ${pet.id}   `;
        assert.strictEqual(routeModule.getPetByIdOrCode(paddedSlug)?.id, pet.id);

        const paddedCode = ` \t ${pet.adoptionCode} \n `;
        assert.strictEqual(routeModule.getPetByIdOrCode(paddedCode)?.id, pet.id);
      }
    });

    // Adversarial malformed inputs triggering notFound()
    const ADVERSARIAL_INVALID_INPUTS = [
      "non-existent-pet",
      "dragon",
      "unicorn",
      "../",
      "..%2F..%2Fetc%2Fpasswd",
      "../../secret",
      "<script>alert(1)</script>",
      "javascript:void(0)",
      "'; DROP TABLE pets; --",
      "' OR '1'='1",
      "$(whoami)",
      "{{7*7}}",
      "",
      "   ",
      "\t\n",
      "#",
      "###",
      "%23",
      "#D00",
      "#D99",
      "#C00",
      "#C99",
      "#O00",
      "#O99",
      "#XYZ",
      "0",
      "-1",
      "999999",
      "null",
      "undefined",
      "NaN",
      "a".repeat(5000),
    ];

    it("2.7 should return undefined from getPetByIdOrCode for all adversarial invalid inputs", () => {
      for (const badInput of ADVERSARIAL_INVALID_INPUTS) {
        const result = routeModule.getPetByIdOrCode(badInput);
        assert.strictEqual(
          result,
          undefined,
          `Expected undefined for adversarial input: ${JSON.stringify(badInput.slice(0, 30))}`
        );
      }
    });

    it("2.8 PetProfilePage should invoke notFound() and throw Next.js HTTP 404 for adversarial inputs", async () => {
      for (const badInput of ADVERSARIAL_INVALID_INPUTS) {
        let threw = false;
        try {
          await routeModule.default({
            params: Promise.resolve({ id: badInput }),
          });
        } catch (err) {
          threw = true;
          const digest = err?.digest || err?.message || "";
          assert.ok(
            digest.includes("NEXT_HTTP_ERROR_FALLBACK;404") ||
            digest.includes("NEXT_NOT_FOUND") ||
            digest.includes("404"),
            `Unexpected error thrown for ${badInput}: ${digest}`
          );
        }
        assert.strictEqual(
          threw,
          true,
          `PetProfilePage failed to trigger notFound() for: ${JSON.stringify(badInput.slice(0, 30))}`
        );
      }
    });

    it("2.9 generateMetadata should gracefully return fallback 404 metadata without throwing for adversarial inputs", async () => {
      for (const badInput of ADVERSARIAL_INVALID_INPUTS) {
        const meta = await routeModule.generateMetadata({
          params: Promise.resolve({ id: badInput }),
        });
        assert.ok(meta, `Metadata was null/undefined for input: ${badInput.slice(0, 20)}`);
        assert.strictEqual(
          meta.title,
          `Pet Not Found — ${SITE_CONFIG.brandName}`,
          `Metadata title mismatch for invalid input ${badInput.slice(0, 20)}`
        );
        assert.strictEqual(
          meta.description,
          "The requested rescue pet profile could not be found."
        );
      }
    });
  });

  // =========================================================================
  // SUITE 3: PROFILE DATA COMPLETENESS & SCHEMA INTEGRITY
  // =========================================================================
  describe("Suite 3: Profile Data Completeness & Schema Integrity", () => {
    it("3.1 every pet must possess a valid, visible Pet ID (#D01, #C01, #O01 format)", () => {
      const codeRegex = /^#[DCO]\d{2}$/;
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          codeRegex.test(pet.adoptionCode),
          `Pet ${pet.name} (${pet.id}) has invalid adoptionCode: '${pet.adoptionCode}'`
        );
      }
    });

    it("3.2 every pet must have complete and well-formed vitals (age, breed, gender, size, color, location)", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(typeof pet.age === "string" && pet.age.trim().length > 0, `Pet ${pet.id} missing age`);
        assert.ok(typeof pet.breed === "string" && pet.breed.trim().length > 0, `Pet ${pet.id} missing breed`);
        assert.ok(pet.gender === "Male" || pet.gender === "Female", `Pet ${pet.id} invalid gender: ${pet.gender}`);
        assert.ok(typeof pet.size === "string" && pet.size.trim().length > 0, `Pet ${pet.id} missing size`);
        assert.ok(typeof pet.color === "string" && pet.color.trim().length > 0, `Pet ${pet.id} missing color`);
        assert.ok(
          typeof pet.location === "string" && pet.location.includes("North Bangalore"),
          `Pet ${pet.id} location should specify North Bangalore: '${pet.location}'`
        );
      }
    });

    it("3.3 every pet must have complete preventative healthcare vitals (vaccination, dewormed, sterilisation)", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          typeof pet.vaccinationStatus === "string" && pet.vaccinationStatus.trim().length > 0,
          `Pet ${pet.id} missing vaccinationStatus`
        );
        assert.ok(
          typeof pet.dewormedStatus === "string" && pet.dewormedStatus.trim().length > 0,
          `Pet ${pet.id} missing dewormedStatus`
        );
        assert.ok(
          typeof pet.sterilisationStatus === "string" && pet.sterilisationStatus.trim().length > 0,
          `Pet ${pet.id} missing sterilisationStatus`
        );
      }
    });

    it("3.4 every pet must possess an informative clinical timeline under Medical History with >= 3 entries", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.medicalHistory) && pet.medicalHistory.length >= 3,
          `Pet ${pet.id} medicalHistory must have >= 3 entries, found: ${pet.medicalHistory?.length}`
        );
        for (const entry of pet.medicalHistory) {
          assert.ok(
            typeof entry === "string" && entry.trim().length >= 15,
            `Pet ${pet.id} has insufficient medical history note: '${entry}'`
          );
        }
      }
    });

    it("3.5 every pet must possess structured bullet points under Adoption Requirements with >= 3 entries", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.adoptionRequirements) && pet.adoptionRequirements.length >= 3,
          `Pet ${pet.id} adoptionRequirements must have >= 3 entries, found: ${pet.adoptionRequirements?.length}`
        );
        for (const req of pet.adoptionRequirements) {
          assert.ok(
            typeof req === "string" && req.trim().length >= 20,
            `Pet ${pet.id} has insufficient adoption requirement detail: '${req}'`
          );
        }
      }
    });

    it("3.6 every pet must possess at least 2 personality tags and a backstory > 40 chars", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.tags) && pet.tags.length >= 2,
          `Pet ${pet.id} tags must have >= 2 items, found: ${pet.tags?.length}`
        );
        assert.ok(
          typeof pet.story === "string" && pet.story.trim().length > 40,
          `Pet ${pet.id} story is missing or too brief: '${pet.story}'`
        );
      }
    });

    it("3.7 every pet must have species strictly in ['dog', 'cat', 'other']", () => {
      const validSpecies = new Set(["dog", "cat", "other"]);
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          validSpecies.has(pet.species),
          `Pet ${pet.id} has unknown species: '${pet.species}'`
        );
      }
    });
  });

  // =========================================================================
  // SUITE 4: MULTI-PHOTO GALLERY & ASSET RESILIENCE
  // =========================================================================
  describe("Suite 4: Multi-Photo Gallery & Asset Verification", () => {
    it("4.1 all primary images and gallery arrays must reference existing disk assets in public/images/", () => {
      const publicDir = path.join(projectRoot, "public");
      for (const pet of SAMPLE_PETS) {
        // Primary image
        assert.ok(pet.image.startsWith("/images/"), `Pet ${pet.id} primary image must start with /images/`);
        const primaryDiskPath = path.join(publicDir, pet.image.replace(/^\//, ""));
        assert.ok(
          fs.existsSync(primaryDiskPath),
          `Pet ${pet.id} primary image missing on disk: ${primaryDiskPath}`
        );

        // Gallery images
        assert.ok(
          Array.isArray(pet.gallery) && pet.gallery.length >= 3,
          `Pet ${pet.id} gallery must contain at least 3 photos`
        );
        for (const photoUrl of pet.gallery) {
          assert.ok(photoUrl.startsWith("/images/"), `Pet ${pet.id} photo must start with /images/: ${photoUrl}`);
          const photoDiskPath = path.join(publicDir, photoUrl.replace(/^\//, ""));
          assert.ok(
            fs.existsSync(photoDiskPath),
            `Pet ${pet.id} gallery photo missing on disk: ${photoDiskPath}`
          );
        }
      }
    });

    it("4.2 image paths must only use existing verified images /images/1.jpeg through /images/7.jpeg", () => {
      const allowedImagePaths = new Set([
        "/images/1.jpeg",
        "/images/2.jpeg",
        "/images/3.jpeg",
        "/images/4.jpeg",
        "/images/5.jpeg",
        "/images/6.jpeg",
        "/images/7.jpeg",
      ]);

      for (const pet of SAMPLE_PETS) {
        assert.ok(
          allowedImagePaths.has(pet.image),
          `Pet ${pet.id} image ${pet.image} not in allowed set`
        );
        for (const g of pet.gallery) {
          assert.ok(
            allowedImagePaths.has(g),
            `Pet ${pet.id} gallery image ${g} not in allowed set`
          );
        }
      }
    });

    it("4.3 PetProfileClient must declare gallery fallback to [pet.image] for null/empty/undefined gallery", () => {
      assert.match(
        clientTsxSource,
        /galleryImages\s*:\s*string\[\]\s*=\s*Array\.isArray\(pet\.gallery\)\s*&&\s*pet\.gallery\.length\s*>\s*0\s*\?\s*pet\.gallery\s*:\s*\[pet\.image\]/,
        "Must verify Array.isArray(pet.gallery) && length > 0 before defaulting to [pet.image]"
      );
    });

    it("4.4 PetProfileClient carousel cycling bounds logic must support wrap-around", () => {
      // Prev wrap-around
      assert.match(
        clientTsxSource,
        /handlePrevImage\s*=\s*useCallback\(\(\)\s*=>\s*\{\s*setSelectedIdx\(\(prev\)\s*=>\s*\(prev\s*>\s*0\s*\?\s*prev\s*-\s*1\s*:\s*galleryImages\.length\s*-\s*1\)\);/s,
        "handlePrevImage must wrap from 0 to length - 1"
      );

      // Next wrap-around
      assert.match(
        clientTsxSource,
        /handleNextImage\s*=\s*useCallback\(\(\)\s*=>\s*\{\s*setSelectedIdx\(\(prev\)\s*=>\s*\(prev\s*<\s*galleryImages\.length\s*-\s*1\s*\?\s*prev\s*\+\s*1\s*:\s*0\)\);/s,
        "handleNextImage must wrap from length - 1 to 0"
      );
    });

    it("4.5 PetProfileClient thumbnail strip must set role='tablist' and dynamic active thumbnail class", () => {
      assert.match(
        clientTsxSource,
        /role="tablist"/,
        "Thumbnail strip must specify role='tablist'"
      );
      assert.match(
        clientTsxSource,
        /role="tab"/,
        "Thumbnail button must specify role='tab'"
      );
      assert.match(
        clientTsxSource,
        /aria-selected=\{isActive\}/,
        "Thumbnail button must bind aria-selected={isActive}"
      );
      assert.match(
        clientTsxSource,
        /className=\{`profile-thumb-btn\s*\$\{\s*isActive\s*\?\s*"active"\s*:\s*""\s*\}`\}/,
        "Thumbnail button must apply 'active' class when active"
      );
      assert.match(
        clientTsxSource,
        /loading="lazy"/,
        "Thumbnail images must use loading='lazy'"
      );
    });
  });

  // =========================================================================
  // SUITE 5: WHATSAPP URL ENCODING & CTA RESILIENCE
  // =========================================================================
  describe("Suite 5: WhatsApp URL Encoding & CTA Resilience", () => {
    it("5.1 WhatsApp helpline number must match official Indian phone number", () => {
      assert.strictEqual(
        SITE_CONFIG.whatsappNumber,
        "918630438778",
        "Official WhatsApp number must be 918630438778"
      );
    });

    it("5.2 buildWhatsAppUrl must produce valid wa.me link with encoded text query", () => {
      const testMsg = "Hello Haven Paws! Testing adoption for Kaju (#D01)";
      const url = buildWhatsAppUrl(testMsg);
      assert.ok(url.startsWith("https://wa.me/918630438778?text="));
      const extractedText = url.replace("https://wa.me/918630438778?text=", "");
      assert.strictEqual(decodeURIComponent(extractedText), testMsg);
      assert.strictEqual(extractedText.includes(" "), false, "Raw space must be percent-encoded");
      assert.strictEqual(extractedText.includes("#"), false, "Raw # must be percent-encoded as %23");
    });

    it("5.3 for every pet, WhatsApp pre-filled message must include pet name and adoptionCode", () => {
      for (const pet of SAMPLE_PETS) {
        const msg = pet.whatsappMessage;
        assert.ok(
          typeof msg === "string" && msg.length > 20,
          `Pet ${pet.id} missing whatsappMessage`
        );
        assert.ok(
          msg.includes(pet.name),
          `Pet ${pet.id} whatsappMessage must include pet name '${pet.name}'`
        );
        assert.ok(
          msg.includes(pet.adoptionCode),
          `Pet ${pet.id} whatsappMessage must include pet adoptionCode '${pet.adoptionCode}'`
        );

        // Test URL generated
        const url = buildWhatsAppUrl(msg);
        assert.ok(url.startsWith("https://wa.me/918630438778?text="));
        const rawQuery = url.split("?text=")[1];
        assert.strictEqual(decodeURIComponent(rawQuery), msg);
      }
    });

    it("5.4 fallback WhatsApp message in PetProfileClient must also include pet name and adoptionCode", () => {
      assert.match(
        clientTsxSource,
        /`Hi \$\{SITE_CONFIG\.brandName\} team, I fell in love with \$\{pet\.name\} \(\$\{pet\.adoptionCode\}\) on your adoption website! Can we schedule a visit to meet\?`/,
        "Fallback inquiry message must include pet.name and pet.adoptionCode"
      );
    });

    it("5.5 adversarial WhatsApp message strings (special characters, ampersands, newlines, emojis) encode cleanly", () => {
      const adversarialMessages = [
        "Hi! Interested in Milo (#D05) & Daisy (#D02)?",
        "Hello 🐾❤️ — We'd love to adopt #D01!\nCan we visit tomorrow at 10:00 AM?",
        "Price & Fees: <$0>? 100% Free Adoption @HavenPaws #123!",
        "Special chars: !@$%^*()_+-=[]{}|;':\",./<>?`~",
      ];

      for (const msg of adversarialMessages) {
        const url = buildWhatsAppUrl(msg);
        assert.ok(url.startsWith("https://wa.me/918630438778?text="));
        // Verify URL syntax is valid
        const parsed = new URL(url);
        assert.strictEqual(parsed.hostname, "wa.me");
        assert.strictEqual(parsed.pathname, "/918630438778");
        const textParam = parsed.searchParams.get("text");
        assert.strictEqual(textParam, msg, "Decoded text parameter must strictly match original message");
      }
    });

    it("5.6 PetProfileClient WhatsApp CTA button must include secure attributes (target='_blank', rel='noopener noreferrer')", () => {
      assert.match(
        clientTsxSource,
        /<a[^>]*href=\{whatsAppInquiryUrl\}[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*className="btn-wa-profile"/s,
        "WhatsApp CTA button must include target='_blank' and rel='noopener noreferrer'"
      );
    });
  });

  // =========================================================================
  // SUITE 6: STRICT CSS TOKEN PRESERVATION
  // =========================================================================
  describe("Suite 6: Strict CSS Token Preservation", () => {
    it("6.1 should pass css-auditor core tokens verification without failures", () => {
      const audit = auditCoreTokens(globalsCssPath);
      assert.strictEqual(audit.allValid, true, "Core CSS tokens audit failed");
      for (const [token, details] of Object.entries(audit.details)) {
        assert.strictEqual(
          details.passed,
          true,
          `CSS token ${token} expected ${details.expected} but found ${details.found}`
        );
      }
    });

    it("6.2 should strictly preserve exact hex values in :root of src/app/globals.css", () => {
      const expectedHexMap = {
        "--bg-canvas": "#FAF7F2",
        "--text-main": "#2B2523",
        "--brand-forest": "#2D5A46",
        "--accent-coral": "#E07A5F",
        "--accent-amber": "#F4A261",
      };

      for (const [varName, hex] of Object.entries(expectedHexMap)) {
        const regex = new RegExp(`${varName}\\s*:\\s*${hex}\\s*;`, "i");
        assert.match(
          globalsCssSource,
          regex,
          `globals.css :root is missing or modified for ${varName}: ${hex}`
        );
      }
    });

    it("6.3 should verify supporting palette variables are intact", () => {
      const supportingTokens = [
        "--bg-surface: #FFFFFF;",
        "--bg-subtle: #F3EEE7;",
        "--text-muted: #6E6662;",
        "--brand-forest-light: #3D755C;",
        "--brand-forest-subtle: #E8F0EC;",
        "--accent-coral-hover: #CC654A;",
        "--accent-amber-subtle: #FEF4EB;",
        "--border-soft: #EAE3D9;",
      ];

      for (const tokenDef of supportingTokens) {
        assert.ok(
          globalsCssSource.includes(tokenDef),
          `globals.css is missing supporting design token: ${tokenDef}`
        );
      }
    });

    it("6.4 should verify all required Pet Profile CSS selectors are present in src/app/globals.css", () => {
      const profileSelectors = [
        ".pet-profile-page-wrapper",
        ".profile-page-main",
        ".profile-nav-bar",
        ".profile-back-link",
        ".profile-breadcrumbs",
        ".pet-profile-client",
        ".profile-grid",
        ".profile-gallery-col",
        ".profile-gallery-card",
        ".profile-hero-wrap",
        ".profile-hero-img",
        ".profile-hero-badges",
        ".profile-hero-counter",
        ".gallery-nav-btn",
        ".profile-thumbnails",
        ".profile-thumb-btn",
        ".profile-thumb-img",
        ".profile-quick-steps",
        ".profile-details-col",
        ".profile-header",
        ".profile-pet-name",
        ".profile-id-badge",
        ".profile-vitals-grid",
        ".vital-card",
        ".vital-label",
        ".vital-value",
        ".health-badges-grid",
        ".health-badge-card",
        ".profile-section-card",
        ".profile-story-text",
        ".profile-timeline-list",
        ".timeline-item",
        ".timeline-marker",
        ".profile-requirements-list",
        ".requirement-item",
        ".profile-cta-card",
        ".profile-cta-badge",
        ".profile-cta-title",
        ".profile-cta-desc",
        ".profile-cta-actions",
        ".btn-wa-profile",
        ".btn-share-profile",
      ];

      const missing = [];
      for (const sel of profileSelectors) {
        if (!globalsCssSource.includes(sel)) {
          missing.push(sel);
        }
      }
      assert.deepStrictEqual(missing, [], `Missing required profile CSS selectors: ${missing.join(", ")}`);
    });

    it("6.5 profile styling must utilize CSS design token variables", () => {
      const tokenUsages = [
        "var(--bg-canvas)",
        "var(--brand-forest)",
        "var(--brand-forest-subtle)",
        "var(--border-soft)",
        "var(--text-main)",
        "var(--text-muted)",
        "var(--radius-lg)",
        "var(--radius-md)",
        "var(--radius-full)",
      ];

      for (const usage of tokenUsages) {
        assert.ok(
          globalsCssSource.includes(usage),
          `Expected globals.css to utilize design token variable: ${usage}`
        );
      }
    });
  });

  // =========================================================================
  // SUITE 7: RESPONSIVE MEDIA QUERIES & VIEWPORT LAYOUT RULES
  // =========================================================================
  describe("Suite 7: Responsive Media Queries & Viewport Layout Rules", () => {
    it("7.1 should pass css-auditor media queries check", () => {
      const mediaAudit = auditMediaQueries(globalsCssPath);
      assert.strictEqual(mediaAudit.allValid, true);
      assert.strictEqual(mediaAudit.hasTabletQuery, true);
      assert.strictEqual(mediaAudit.hasMobileQuery, true);
    });

    it("7.2 Desktop viewport rules (1200px+): container max-width and 2-column profile grid", () => {
      assert.match(
        globalsCssSource,
        /\.container\s*\{[^}]*max-width:\s*1200px;/,
        ".container must have max-width: 1200px for desktop"
      );
      assert.match(
        globalsCssSource,
        /\.profile-grid\s*\{[^}]*grid-template-columns:\s*1fr\s+1\.15fr;/,
        ".profile-grid must define 2-column layout for desktop (1fr 1.15fr)"
      );
      assert.match(
        globalsCssSource,
        /\.profile-gallery-col\s*\{[^}]*position:\s*sticky;/,
        ".profile-gallery-col must be sticky on desktop"
      );
      assert.match(
        globalsCssSource,
        /\.profile-vitals-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\);/,
        ".profile-vitals-grid must have 3 columns on desktop"
      );
    });

    it("7.3 Tablet breakpoint rules (@media (max-width: 960px)): collapses profile grid to 1 column", () => {
      const tabletBlock = globalsCssSource.split(/@media\s*\(\s*max-width\s*:\s*960px\s*\)/)[1];
      assert.ok(tabletBlock, "Missing @media (max-width: 960px) block");

      // Extract tablet block before the next @media
      const tabletContent = tabletBlock.split("@media")[0];

      assert.match(
        tabletContent,
        /\.profile-grid\s*\{[^}]*grid-template-columns:\s*1fr;/,
        "Tablet media query must collapse .profile-grid to 1fr"
      );
      assert.match(
        tabletContent,
        /\.profile-gallery-col\s*\{[^}]*position:\s*static;/,
        "Tablet media query must reset .profile-gallery-col to static position"
      );
      assert.match(
        tabletContent,
        /\.profile-hero-wrap\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*10;/,
        "Tablet media query must adjust .profile-hero-wrap aspect-ratio to 16 / 10"
      );
    });

    it("7.4 Mobile breakpoint rules (@media (max-width: 640px)): handles 375px-640px viewport adaptations", () => {
      const mobileBlock = globalsCssSource.split(/@media\s*\(\s*max-width\s*:\s*640px\s*\)/)[1];
      assert.ok(mobileBlock, "Missing @media (max-width: 640px) block");

      assert.match(
        mobileBlock,
        /\.profile-nav-bar\s*\{[^}]*flex-direction:\s*column;/,
        "Mobile media query must stack .profile-nav-bar vertically"
      );
      assert.match(
        mobileBlock,
        /\.profile-vitals-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\);/,
        "Mobile media query must adapt .profile-vitals-grid to 2 columns"
      );
      assert.match(
        mobileBlock,
        /\.health-badges-grid\s*\{[^}]*grid-template-columns:\s*1fr;/,
        "Mobile media query must adapt .health-badges-grid to single column"
      );
      assert.match(
        mobileBlock,
        /\.profile-cta-actions\s*\{[^}]*flex-direction:\s*column;/,
        "Mobile media query must stack .profile-cta-actions vertically"
      );
      assert.match(
        mobileBlock,
        /\.btn-wa-profile,\s*\.btn-share-profile\s*\{[^}]*width:\s*100%;/,
        "Mobile media query must make profile action buttons full width (100%)"
      );
      assert.match(
        mobileBlock,
        /\.pet-profile-client\s*\{[^}]*padding-bottom:\s*96px;/,
        "Mobile media query must add padding-bottom: 96px on .pet-profile-client to clear floating WhatsApp button"
      );
      assert.match(
        mobileBlock,
        /\.mobile-float-wa\s*\{[^}]*display:\s*flex;/,
        "Mobile media query must display mobile float WhatsApp button"
      );
    });

    it("7.5 iOS Safari zoom prevention: search input font-size must be at least 16px on mobile", () => {
      const mobileBlock = globalsCssSource.split(/@media\s*\(\s*max-width\s*:\s*640px\s*\)/)[1];
      assert.match(
        mobileBlock,
        /\.search-input\s*\{[^}]*font-size:\s*16px;/,
        "Mobile search input must have font-size: 16px to prevent iOS auto-zoom"
      );
    });
  });
});
