import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SAMPLE_PETS } from "../src/data/pets.ts";
import {
  matchesCategory,
  matchesSearch,
  isPuppy,
  isKitten,
  isSpecialNeeds,
  isSenior,
  isOtherAnimal,
  CatalogHarness,
  FILTER_TABS,
} from "./helpers/catalog-harness.mjs";
import { buildWhatsAppUrl, SITE_CONFIG } from "../src/config/site.ts";

describe("Empirical Challenger 2: Data Model, Assets & Consumer Compatibility", () => {
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, "public");

  // 1. Data Model Completeness & Schema for all 9 pets
  describe("1. SAMPLE_PETS Data Model Integrity", () => {
    it("should contain exactly 9 pets in SAMPLE_PETS", () => {
      assert.equal(SAMPLE_PETS.length, 9, `Expected 9 pets, received ${SAMPLE_PETS.length}`);
    });

    it("should have unique, non-empty, slug-compatible IDs for each pet", () => {
      const ids = new Set();
      for (const pet of SAMPLE_PETS) {
        assert.ok(typeof pet.id === "string", `Pet id must be a string: ${JSON.stringify(pet)}`);
        assert.ok(pet.id.trim().length > 0, `Pet id cannot be empty for pet: ${pet.name}`);
        assert.match(pet.id, /^[a-z0-9-]+$/, `Pet id '${pet.id}' must be lowercase alphanumeric with hyphens`);
        assert.ok(!ids.has(pet.id), `Duplicate pet id found: '${pet.id}'`);
        ids.add(pet.id);
      }
    });

    it("should have unique, formatted adoption codes (#...) for each pet", () => {
      const codes = new Set();
      for (const pet of SAMPLE_PETS) {
        assert.ok(typeof pet.adoptionCode === "string", `adoptionCode must be string for ${pet.id}`);
        assert.ok(pet.adoptionCode.startsWith("#"), `adoptionCode must start with '#' for ${pet.id}: received ${pet.adoptionCode}`);
        assert.match(pet.adoptionCode, /^#[A-Z]\d{2}$/, `adoptionCode '${pet.adoptionCode}' must follow '#[Letter][Digits]' pattern`);
        assert.ok(!codes.has(pet.adoptionCode), `Duplicate adoption code '${pet.adoptionCode}'`);
        codes.add(pet.adoptionCode);
      }
    });

    it("should verify non-empty valid strings for all standard required fields", () => {
      const requiredFields = [
        "name",
        "species",
        "breed",
        "age",
        "gender",
        "size",
        "color",
        "image",
        "alt",
        "whatsappMessage",
        "story",
        "badgeLabel",
        "location",
        "vaccinationStatus",
        "dewormedStatus",
        "sterilisationStatus",
      ];

      for (const pet of SAMPLE_PETS) {
        for (const field of requiredFields) {
          const val = pet[field];
          assert.equal(
            typeof val,
            "string",
            `Field '${field}' on pet '${pet.id}' must be a string, got ${typeof val}`
          );
          assert.ok(
            val.trim().length > 0,
            `Field '${field}' on pet '${pet.id}' cannot be empty or whitespace-only`
          );
        }

        // Species enum constraint
        assert.ok(
          ["dog", "cat", "other"].includes(pet.species),
          `Invalid species '${pet.species}' on pet '${pet.id}'`
        );

        // Gender enum constraint
        assert.ok(
          ["Male", "Female"].includes(pet.gender),
          `Invalid gender '${pet.gender}' on pet '${pet.id}'`
        );
      }
    });

    it("should verify tags array is a non-empty array of valid strings", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(Array.isArray(pet.tags), `tags must be an array for ${pet.id}`);
        assert.ok(pet.tags.length > 0, `tags array must not be empty for ${pet.id}`);
        for (const tag of pet.tags) {
          assert.equal(typeof tag, "string", `tag item must be a string in ${pet.id}`);
          assert.ok(tag.trim().length > 0, `tag item cannot be empty string in ${pet.id}`);
        }
      }
    });

    it("should verify medicalHistory is a non-empty array of strings (minimum 3 records)", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.medicalHistory),
          `medicalHistory must be an array on pet ${pet.id}`
        );
        assert.ok(
          pet.medicalHistory.length >= 3,
          `medicalHistory on pet ${pet.id} must have at least 3 entries, got ${pet.medicalHistory.length}`
        );
        for (let i = 0; i < pet.medicalHistory.length; i++) {
          const entry = pet.medicalHistory[i];
          assert.equal(
            typeof entry,
            "string",
            `medicalHistory[${i}] on pet ${pet.id} must be a string`
          );
          assert.ok(
            entry.trim().length > 10,
            `medicalHistory[${i}] on pet ${pet.id} must be a detailed description (>10 chars)`
          );
        }
      }
    });

    it("should verify adoptionRequirements is a non-empty array of strings (minimum 3 records)", () => {
      for (const pet of SAMPLE_PETS) {
        assert.ok(
          Array.isArray(pet.adoptionRequirements),
          `adoptionRequirements must be an array on pet ${pet.id}`
        );
        assert.ok(
          pet.adoptionRequirements.length >= 3,
          `adoptionRequirements on pet ${pet.id} must have at least 3 entries, got ${pet.adoptionRequirements.length}`
        );
        for (let i = 0; i < pet.adoptionRequirements.length; i++) {
          const req = pet.adoptionRequirements[i];
          assert.equal(
            typeof req,
            "string",
            `adoptionRequirements[${i}] on pet ${pet.id} must be a string`
          );
          assert.ok(
            req.trim().length > 10,
            `adoptionRequirements[${i}] on pet ${pet.id} must be a detailed description (>10 chars)`
          );
        }
      }
    });

    it("should verify isSpecialNeeds and isSenior booleans are correctly typed", () => {
      for (const pet of SAMPLE_PETS) {
        if (pet.isSpecialNeeds !== undefined) {
          assert.equal(
            typeof pet.isSpecialNeeds,
            "boolean",
            `isSpecialNeeds on pet ${pet.id} must be boolean, got ${typeof pet.isSpecialNeeds}`
          );
        }
        if (pet.isSenior !== undefined) {
          assert.equal(
            typeof pet.isSenior,
            "boolean",
            `isSenior on pet ${pet.id} must be boolean, got ${typeof pet.isSenior}`
          );
        }
      }

      // Verify specific expected flags
      const specialNeedsPets = SAMPLE_PETS.filter((p) => p.isSpecialNeeds === true);
      assert.ok(
        specialNeedsPets.some((p) => p.id === "cleo"),
        "Expected Cleo to have isSpecialNeeds: true"
      );

      const seniorPets = SAMPLE_PETS.filter((p) => p.isSenior === true);
      assert.ok(
        seniorPets.some((p) => p.id === "rocky"),
        "Expected Rocky to have isSenior: true"
      );
    });
  });

  // 2. Physical Asset Integrity & Verification on Disk
  describe("2. Physical Asset Validity on Disk (public/images/)", () => {
    it("should verify public/images directory exists on disk", () => {
      const imgDir = path.join(publicDir, "images");
      assert.ok(fs.existsSync(imgDir), `public/images directory does not exist at ${imgDir}`);
      const stat = fs.statSync(imgDir);
      assert.ok(stat.isDirectory(), `public/images is not a directory`);
    });

    it("should verify primary pet.image exists on disk, has non-zero size, and valid JPEG header", () => {
      const actualDiskFiles = fs.readdirSync(path.join(publicDir, "images"));

      for (const pet of SAMPLE_PETS) {
        assert.ok(pet.image.startsWith("/images/"), `Image path must start with '/images/' in pet ${pet.id}`);
        const relativeFilePath = pet.image.replace(/^\//, "");
        const diskPath = path.join(publicDir, relativeFilePath);

        assert.ok(
          fs.existsSync(diskPath),
          `Primary image '${pet.image}' for pet '${pet.id}' does NOT exist at ${diskPath}`
        );

        const stat = fs.statSync(diskPath);
        assert.ok(stat.isFile(), `Primary image for ${pet.id} is not a file`);
        assert.ok(stat.size > 1000, `Primary image for ${pet.id} is suspiciously small: ${stat.size} bytes`);

        // Case sensitivity check for Linux deployment environments
        const fileName = path.basename(relativeFilePath);
        assert.ok(
          actualDiskFiles.includes(fileName),
          `Filename '${fileName}' case mismatch with actual disk files: [${actualDiskFiles.join(", ")}]`
        );

        // Magic bytes check for JPEG (0xFF 0xD8 0xFF)
        const buffer = Buffer.alloc(3);
        const fd = fs.openSync(diskPath, "r");
        fs.readSync(fd, buffer, 0, 3, 0);
        fs.closeSync(fd);
        assert.equal(
          buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
          true,
          `Image ${pet.image} does not have valid JPEG header magic bytes`
        );
      }
    });

    it("should verify all images in pet.gallery exist on disk, have non-zero size, and match case", () => {
      const actualDiskFiles = fs.readdirSync(path.join(publicDir, "images"));

      for (const pet of SAMPLE_PETS) {
        assert.ok(Array.isArray(pet.gallery), `gallery must be array on pet ${pet.id}`);
        assert.ok(
          pet.gallery.length >= 2,
          `pet.gallery on ${pet.id} must contain at least 2 images, got ${pet.gallery.length}`
        );

        for (let i = 0; i < pet.gallery.length; i++) {
          const imgPath = pet.gallery[i];
          assert.ok(
            typeof imgPath === "string" && imgPath.startsWith("/images/"),
            `Gallery[${i}] '${imgPath}' on pet ${pet.id} must start with '/images/'`
          );

          const relativeFilePath = imgPath.replace(/^\//, "");
          const diskPath = path.join(publicDir, relativeFilePath);

          assert.ok(
            fs.existsSync(diskPath),
            `Gallery image '${imgPath}' for pet '${pet.id}' does NOT exist at ${diskPath}`
          );

          const stat = fs.statSync(diskPath);
          assert.ok(stat.isFile(), `Gallery image ${imgPath} is not a file`);
          assert.ok(stat.size > 1000, `Gallery image ${imgPath} is suspiciously small: ${stat.size} bytes`);

          // Case-sensitive check
          const fileName = path.basename(relativeFilePath);
          assert.ok(
            actualDiskFiles.includes(fileName),
            `Gallery file '${fileName}' case mismatch on pet ${pet.id}`
          );
        }
      }
    });

    it("should verify that all images reference valid assets between /images/1.jpeg and /images/7.jpeg", () => {
      const validAssets = new Set([
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
          validAssets.has(pet.image),
          `Primary image '${pet.image}' on ${pet.id} is outside allowed range (1.jpeg - 7.jpeg)`
        );

        for (const galleryImg of pet.gallery) {
          assert.ok(
            validAssets.has(galleryImg),
            `Gallery image '${galleryImg}' on ${pet.id} is outside allowed range (1.jpeg - 7.jpeg)`
          );
        }
      }
    });
  });

  // 3. Consumer Compatibility Verification
  describe("3. Consumer Compatibility & Zero-Exception Guarantees", () => {
    it("Consumer: PetCard.tsx property contract compliance", () => {
      // PetCard accesses:
      // pet.species, pet.badgeLabel, pet.image, pet.alt, pet.name, pet.age,
      // pet.breed, pet.gender, pet.color, pet.tags, pet.whatsappMessage
      const cardSource = fs.readFileSync(path.join(projectRoot, "src/components/PetCard.tsx"), "utf-8");
      assert.ok(cardSource.includes("pet.species"));
      assert.ok(cardSource.includes("pet.badgeLabel"));
      assert.ok(cardSource.includes("pet.image"));
      assert.ok(cardSource.includes("pet.name"));
      assert.ok(cardSource.includes("pet.tags.map"));

      for (const pet of SAMPLE_PETS) {
        // className construction
        const speciesClass = `badge-species${pet.species === "cat" ? " cat" : ""}`;
        assert.ok(typeof speciesClass === "string");

        // Image props
        assert.ok(pet.image && pet.alt);

        // Header props
        assert.ok(pet.name && pet.age);

        // Breed line
        const breedLine = `${pet.breed} • ${pet.gender} • ${pet.color}`;
        assert.ok(!breedLine.includes("undefined") && !breedLine.includes("null"));

        // Tags map
        const mappedTags = pet.tags.map((tag) => tag);
        assert.equal(mappedTags.length, pet.tags.length);
        assert.ok(mappedTags.every((t) => typeof t === "string"));

        // WhatsApp CTA URL
        const waUrl = buildWhatsAppUrl(pet.whatsappMessage);
        assert.ok(waUrl.startsWith(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=`));
        assert.ok(!waUrl.includes("undefined"));
      }
    });

    it("Consumer: PetModal.tsx property contract compliance", () => {
      // PetModal accesses:
      // pet.image, pet.name, pet.adoptionCode, pet.species, pet.breed, pet.age,
      // pet.gender, pet.vaccinationStatus, pet.dewormedStatus, pet.sterilisationStatus,
      // pet.location, pet.story, pet.whatsappMessage
      const modalSource = fs.readFileSync(path.join(projectRoot, "src/components/PetModal.tsx"), "utf-8");
      assert.ok(modalSource.includes("pet.image"));
      assert.ok(modalSource.includes("pet.name"));
      assert.ok(modalSource.includes("pet.adoptionCode"));
      assert.ok(modalSource.includes("pet.vaccinationStatus"));
      assert.ok(modalSource.includes("pet.dewormedStatus"));
      assert.ok(modalSource.includes("pet.sterilisationStatus"));
      assert.ok(modalSource.includes("pet.location"));
      assert.ok(modalSource.includes("pet.story"));
      assert.ok(modalSource.includes("pet.whatsappMessage"));

      for (const pet of SAMPLE_PETS) {
        assert.ok(pet.image && typeof pet.image === "string");
        assert.ok(pet.name && typeof pet.name === "string");
        assert.ok(pet.adoptionCode && typeof pet.adoptionCode === "string");

        // Species label check
        const speciesLabel = pet.species === "dog" ? "Dog" : "Cat";
        assert.ok(["Dog", "Cat"].includes(speciesLabel));

        const metaLine = `${speciesLabel} • ${pet.breed} • ${pet.age} (${pet.gender})`;
        assert.ok(!metaLine.includes("undefined") && !metaLine.includes("null"));

        // Checklist checks
        assert.ok(pet.vaccinationStatus && pet.vaccinationStatus.length > 0);
        assert.ok(pet.dewormedStatus && pet.dewormedStatus.length > 0);
        assert.ok(pet.sterilisationStatus && pet.sterilisationStatus.length > 0);
        assert.ok(pet.location && pet.location.length > 0);

        // Story check
        assert.ok(pet.story && pet.story.length > 10);

        // WhatsApp CTA URL
        const waUrl = buildWhatsAppUrl(pet.whatsappMessage);
        assert.ok(waUrl.includes(encodeURIComponent(pet.whatsappMessage)));
      }
    });

    it("Consumer: HomeClient.tsx species filtering and counts", () => {
      const dogCount = SAMPLE_PETS.filter((p) => p.species === "dog").length;
      const catCount = SAMPLE_PETS.filter((p) => p.species === "cat").length;

      assert.ok(dogCount >= 1, "dogCount must be >= 1");
      assert.ok(catCount >= 1, "catCount must be >= 1");

      const visibleAll = SAMPLE_PETS;
      const visibleDogs = SAMPLE_PETS.filter((p) => p.species === "dog");
      const visibleCats = SAMPLE_PETS.filter((p) => p.species === "cat");

      assert.equal(visibleAll.length, 9);
      assert.equal(visibleDogs.length, dogCount);
      assert.equal(visibleCats.length, catCount);

      // Verify all rendered pets have valid IDs for keys
      const keys = visibleAll.map((p) => p.id);
      const uniqueKeys = new Set(keys);
      assert.equal(uniqueKeys.size, keys.length, "All keys in HomeClient pet grid must be unique");
    });

    it("Consumer: AdoptCatalogClient.tsx classifier coverage across all 9 pets", () => {
      // 8 categories
      const categories = [
        "all",
        "dogs",
        "puppies",
        "cats",
        "kittens",
        "special-needs",
        "senior",
        "other",
      ];

      for (const cat of categories) {
        const matches = SAMPLE_PETS.filter((p) => matchesCategory(p, cat));
        assert.ok(
          matches.length > 0,
          `Category '${cat}' has 0 matching pets in SAMPLE_PETS! Every category must have at least 1 companion.`
        );
      }

      // Verify specific counts
      const dogs = SAMPLE_PETS.filter((p) => matchesCategory(p, "dogs"));
      const puppies = SAMPLE_PETS.filter((p) => matchesCategory(p, "puppies"));
      const cats = SAMPLE_PETS.filter((p) => matchesCategory(p, "cats"));
      const kittens = SAMPLE_PETS.filter((p) => matchesCategory(p, "kittens"));
      const specialNeeds = SAMPLE_PETS.filter((p) => matchesCategory(p, "special-needs"));
      const senior = SAMPLE_PETS.filter((p) => matchesCategory(p, "senior"));
      const other = SAMPLE_PETS.filter((p) => matchesCategory(p, "other"));

      assert.equal(dogs.length, 6, "Expected 6 dogs");
      assert.equal(puppies.length, 5, "Expected 5 puppies");
      assert.equal(cats.length, 2, "Expected 2 cats");
      assert.equal(kittens.length, 1, "Expected 1 kitten (Amber)");
      assert.equal(specialNeeds.length, 1, "Expected 1 special needs pet (Cleo)");
      assert.equal(senior.length, 1, "Expected 1 senior pet (Rocky)");
      assert.equal(other.length, 1, "Expected 1 other pet (Oreo)");
    });

    it("Consumer: AdoptCatalogClient.tsx search safety under hostile queries", () => {
      const hostileQueries = [
        "   ",
        "???",
        "***.*",
        "[a-z]+",
        "(.*)",
        "\\d{2}",
        "+91",
        "^#D01$",
        "<script>alert(1)</script>",
        "'; DROP TABLE pets; --",
        "🐕 🐈 🐾",
      ];

      for (const q of hostileQueries) {
        // Must not throw any exception or regex error
        assert.doesNotThrow(() => {
          const results = SAMPLE_PETS.filter((p) => matchesSearch(p, q));
          assert.ok(Array.isArray(results));
        }, `Query '${q}' caused an exception in matchesSearch!`);
      }
    });

    it("Consumer: AdoptCatalogClient.tsx WhatsApp empty state URL generation", () => {
      // Test when empty state generates WhatsApp URL
      const queryEmptyUrl = buildWhatsAppUrl(
        `Hi Haven Paws team, I was searching for "xyz" on your adoption website but couldn't find a matching rescue. Are there any upcoming pets matching this?`
      );
      assert.ok(queryEmptyUrl.startsWith(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=`));
      assert.ok(queryEmptyUrl.includes("xyz"));

      const filterEmptyUrl = buildWhatsAppUrl(
        `Hi Haven Paws team, I'm looking to adopt a companion in the Senior category. Could you let me know about upcoming rescues?`
      );
      assert.ok(filterEmptyUrl.startsWith(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=`));
      assert.ok(filterEmptyUrl.includes("Senior"));
    });
  });
});
