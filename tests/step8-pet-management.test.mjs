import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPetManagementAction } from "./helpers/pet-action-loader.mjs";
import { generateSlug, getNextAdoptionCode } from "../src/lib/pet-utils.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const adminPetsPagePath = path.join(projectRoot, "src", "app", "admin", "pets", "page.tsx");
const adminNewPetPagePath = path.join(projectRoot, "src", "app", "admin", "pets", "new", "page.tsx");
const adminEditPetPagePath = path.join(projectRoot, "src", "app", "admin", "pets", "[id]", "edit", "page.tsx");
const adminPetCatalogClientPath = path.join(projectRoot, "src", "components", "AdminPetCatalogClient.tsx");
const adminPetFormPath = path.join(projectRoot, "src", "components", "AdminPetForm.tsx");
const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");

describe("Step 8: Mobile-Friendly Admin Pet Management Suite", () => {
  let petActionModule = null;
  let cleanup = null;

  before(async () => {
    const loaded = await loadPetManagementAction(projectRoot);
    petActionModule = loaded;
    cleanup = loaded.cleanup;
  });

  after(() => {
    if (typeof cleanup === "function") cleanup();
  });

  // =========================================================================
  // 1. Slug & Auto-Adoption Code Generation
  // =========================================================================
  describe("1. Slug & Sequential Code Generation Mechanics", () => {
    it("should generate clean URL-friendly slugs from human names", () => {
      assert.equal(generateSlug("Rocky"), "rocky");
      assert.equal(generateSlug("Cleo & Milo!"), "cleo-milo");
      assert.equal(generateSlug("  Sweet Pea  "), "sweet-pea");
      assert.equal(generateSlug("123 Dog"), "123-dog");
      assert.equal(generateSlug("---"), "companion");
      assert.equal(generateSlug(""), "companion");
    });

    it("should calculate sequential adoption codes with proper prefixes", async () => {
      const dogCode = await getNextAdoptionCode("dog");
      assert.match(dogCode, /^#D\d{2,}$/, "Dog codes must start with #D followed by 2+ digits");

      const catCode = await getNextAdoptionCode("cat");
      assert.match(catCode, /^#C\d{2,}$/, "Cat codes must start with #C followed by 2+ digits");

      const otherCode = await getNextAdoptionCode("other");
      assert.match(otherCode, /^#O\d{2,}$/, "Other animal codes must start with #O");
    });
  });

  // =========================================================================
  // 2. createPet Action Validation & Mechanics
  // =========================================================================
  describe("2. createPet Action Validation & Storage Logic", () => {
    it("should reject companion creation with missing name or short name", async () => {
      const formData = new FormData();
      formData.set("name", "R");
      formData.set("breed", "Indie Mix");
      formData.set("age", "2 Months");
      formData.set("story", "A very playful and energetic puppy rescued from North Bangalore.");

      const result = await petActionModule.mod.createPet(null, formData);
      assert.equal(result.success, false);
      assert.match(result.error, /companion name.*2 letters/i);
    });

    it("should reject companion creation with missing breed or age", async () => {
      const formData = new FormData();
      formData.set("name", "Bruno");
      formData.set("breed", "");
      formData.set("age", "1 Year");
      formData.set("story", "Healthy and alert rescue dog ready for adoption.");

      const result = await petActionModule.mod.createPet(null, formData);
      assert.equal(result.success, false);
      assert.match(result.error, /breed/i);

      formData.set("breed", "Indie");
      formData.set("age", "");
      const res2 = await petActionModule.mod.createPet(null, formData);
      assert.equal(res2.success, false);
      assert.match(res2.error, /age/i);
    });

    it("should reject companion creation with short story (< 10 chars)", async () => {
      const formData = new FormData();
      formData.set("name", "Bruno");
      formData.set("breed", "Indie");
      formData.set("age", "1 Year");
      formData.set("story", "Short");

      const result = await petActionModule.mod.createPet(null, formData);
      assert.equal(result.success, false);
      assert.match(result.error, /story.*10 letters/i);
    });

    it("should successfully insert pet record into Supabase with auto-slug and starter photo", async () => {
      let insertedPet = null;
      let loggedActivity = null;

      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null }),
                }),
                like: () => Promise.resolve({ data: [{ adoption_code: "#D09" }], error: null }),
              }),
              insert: async (data) => {
                insertedPet = data;
                return { error: null };
              },
            };
          }
          if (table === "activity_logs") {
            return {
              insert: async (log) => {
                loggedActivity = log;
                return { error: null };
              },
            };
          }
          return { select: () => ({}) };
        },
      };

      petActionModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("name", "Shadow");
      formData.set("species", "dog");
      formData.set("breed", "Indie Mix");
      formData.set("age", "3 Months");
      formData.set("gender", "Female");
      formData.set("size", "Medium");
      formData.set("color", "Black & Tan");
      formData.set("tags", "Playful Pup, Great with Kids");
      formData.set("story", "Rescued near Rajanukunte, Shadow is a joyful pup who loves chasing balls.");
      formData.set("starterPhoto", "/images/4.jpeg");

      const result = await petActionModule.mod.createPet(null, formData);
      assert.equal(result.success, true);
      assert.equal(result.slug, "shadow");
      assert.equal(result.adoptionCode, "#D10");
      assert.ok(insertedPet, "Pet record must be inserted");
      assert.equal(insertedPet.name, "Shadow");
      assert.equal(insertedPet.badge_label, "Puppy");
      assert.equal(insertedPet.image, "/images/4.jpeg");
      assert.deepEqual(insertedPet.tags, ["Playful Pup", "Great with Kids"]);
      assert.ok(loggedActivity, "Activity log should be recorded");
    });
  });

  // =========================================================================
  // 3. updatePet & updatePetStatus Actions
  // =========================================================================
  describe("3. updatePet & updatePetStatus Actions", () => {
    it("should update companion fields and timestamp", async () => {
      let updatedData = null;
      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              update: (data) => ({
                eq: async (field, val) => {
                  updatedData = { ...data, [field]: val };
                  return { error: null };
                },
              }),
            };
          }
          if (table === "activity_logs") {
            return { insert: async () => ({ error: null }) };
          }
          return {};
        },
      };

      petActionModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("slug", "kaju");
      formData.set("name", "Kaju Senior");
      formData.set("breed", "Indie Mix");
      formData.set("age", "7 Years");
      formData.set("gender", "Male");
      formData.set("story", "Still the happiest cuddle bug around Bangalore.");

      const result = await petActionModule.mod.updatePet(null, formData);
      assert.equal(result.success, true);
      assert.ok(updatedData, "Must update record");
      assert.equal(updatedData.name, "Kaju Senior");
      assert.equal(updatedData.slug, "kaju");
      assert.ok(updatedData.updated_at, "Must update timestamp");
    });

    it("should update pet status via 1-tap updatePetStatus", async () => {
      let statusUpdate = null;
      const mockClient = {
        from: (table) => ({
          update: (data) => ({
            eq: async (f, v) => {
              statusUpdate = { ...data, [f]: v };
              return { error: null };
            },
          }),
        }),
      };
      petActionModule.setMockClient(mockClient);

      const res = await petActionModule.mod.updatePetStatus("cleo", "pending");
      assert.equal(res.success, true);
      assert.equal(statusUpdate.status, "pending");
      assert.equal(statusUpdate.badge_label, "In Progress");
    });
  });

  // =========================================================================
  // 4. Celebratory markPetAsAdopted Flow
  // =========================================================================
  describe("4. Celebratory markPetAsAdopted Flow", () => {
    it("should validate adopter names and quote", async () => {
      const formData = new FormData();
      formData.set("slug", "cleo");
      formData.set("adopterNames", "");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /adopter's name/i);
    });

    it("should update pet status and create an adoption_records story", async () => {
      let petStatusUpdated = null;
      let successStoryInserted = null;

      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { name: "Cleo", breed: "Calico Cat", species: "cat", image: "/images/6.jpeg" },
                    error: null,
                  }),
                }),
              }),
              update: (data) => ({
                eq: async (f, v) => {
                  petStatusUpdated = { ...data, [f]: v };
                  return { error: null };
                },
              }),
            };
          }
          if (table === "adoption_records") {
            return {
              insert: async (data) => {
                successStoryInserted = data;
                return { error: null };
              },
            };
          }
          if (table === "activity_logs") {
            return { insert: async () => ({ error: null }) };
          }
          return {};
        },
      };

      petActionModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("slug", "cleo");
      formData.set("adopterNames", "Kavya & Rohan");
      formData.set("neighborhood", "Koramangala, Bangalore");
      formData.set("adoptedDate", "November 2026");
      formData.set("afterQuote", "Cleo settled right onto our sunny rug and purred all day!");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, true);
      assert.match(res.message, /Forever Home Day/i);
      assert.equal(petStatusUpdated.status, "adopted");
      assert.ok(successStoryInserted, "Must insert adoption record");
      assert.equal(successStoryInserted.pet_name, "Cleo");
      assert.equal(successStoryInserted.adopter_names, "Kavya & Rohan");
    });
  });

  // =========================================================================
  // 5. deletePet Action
  // =========================================================================
  describe("5. deletePet Action", () => {
    it("should delete pet by slug", async () => {
      let deletedSlug = null;
      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              delete: () => ({
                eq: async (f, v) => {
                  deletedSlug = v;
                  return { error: null };
                },
              }),
            };
          }
          if (table === "activity_logs") {
            return { insert: async () => ({ error: null }) };
          }
          return {};
        },
      };

      petActionModule.setMockClient(mockClient);
      const res = await petActionModule.mod.deletePet("old-pet");
      assert.equal(res.success, true);
      assert.equal(deletedSlug, "old-pet");
    });
  });

  // =========================================================================
  // 6. UI Components & Page Files Auditing
  // =========================================================================
  describe("6. UI Components & Page Routes Auditing", () => {
    it("should verify /admin/pets/page.tsx exists and renders AdminPetCatalogClient", () => {
      assert.ok(fs.existsSync(adminPetsPagePath), "admin/pets/page.tsx must exist");
      const code = fs.readFileSync(adminPetsPagePath, "utf-8");
      assert.ok(code.includes("getAllPetsForAdmin"), "Must fetch pets");
      assert.ok(code.includes("AdminPetCatalogClient"), "Must render AdminPetCatalogClient");
    });

    it("should verify /admin/pets/new/page.tsx renders AdminPetForm with mode='create'", () => {
      assert.ok(fs.existsSync(adminNewPetPagePath), "admin/pets/new/page.tsx must exist");
      const code = fs.readFileSync(adminNewPetPagePath, "utf-8");
      assert.ok(code.includes("AdminPetForm"), "Must render AdminPetForm");
      assert.ok(code.includes('mode="create"'), "Must be in create mode");
    });

    it("should verify /admin/pets/[id]/edit/page.tsx renders AdminPetForm with mode='edit'", () => {
      assert.ok(fs.existsSync(adminEditPetPagePath), "admin/pets/[id]/edit/page.tsx must exist");
      const code = fs.readFileSync(adminEditPetPagePath, "utf-8");
      assert.ok(code.includes("getPetById"), "Must look up pet by ID");
      assert.ok(code.includes('mode="edit"'), "Must be in edit mode");
    });

    it("should verify AdminPetCatalogClient contains search, status filters, and Mark Adopted modal", () => {
      assert.ok(fs.existsSync(adminPetCatalogClientPath), "AdminPetCatalogClient.tsx must exist");
      const code = fs.readFileSync(adminPetCatalogClientPath, "utf-8");
      assert.ok(code.includes('"use client"'), "Must be client component");
      assert.ok(code.includes("admin-search-input"), "Must have search input");
      assert.ok(code.includes("admin-status-tabs"), "Must have status tabs");
      assert.ok(code.includes("markPetAsAdopted"), "Must handle Mark as Adopted");
      assert.ok(code.includes("updatePetStatus"), "Must handle quick status change");
      assert.ok(code.includes("deletePet"), "Must handle delete");
    });

    it("should verify AdminPetForm contains species picker, photo upload, tags, and sticky save bar", () => {
      assert.ok(fs.existsSync(adminPetFormPath), "AdminPetForm.tsx must exist");
      const code = fs.readFileSync(adminPetFormPath, "utf-8");
      assert.ok(code.includes('"use client"'), "Must be client component");
      assert.ok(code.includes("species-pills-row"), "Must have species picker");
      assert.ok(code.includes("tags-chip-cloud"), "Must have interactive personality tags");
      assert.ok(code.includes("photo-preview-box"), "Must have live photo preview");
      assert.ok(code.includes("admin-form-sticky-actions"), "Must have sticky bottom save bar");
    });
  });

  // =========================================================================
  // 7. CSS & Responsive Design Auditing
  // =========================================================================
  describe("7. CSS Styling & Responsive Design Auditing", () => {
    it("should define essential admin pet management classes in globals.css", () => {
      const css = fs.readFileSync(globalsCssPath, "utf-8");

      const requiredClasses = [
        ".admin-pet-manager",
        ".admin-directory-header",
        ".btn-add-pet-cta",
        ".admin-search-wrap",
        ".admin-status-tabs",
        ".admin-pets-grid",
        ".admin-pet-manage-card",
        ".manage-card-media",
        ".manage-card-status",
        ".manage-card-actions",
        ".admin-modal-overlay",
        ".admin-modal-card",
        ".admin-pet-form-container",
        ".admin-form-section",
        ".species-pills-row",
        ".photo-preview-box",
        ".tags-chip-cloud",
        ".tag-chip-btn",
        ".admin-form-sticky-actions",
        ".btn-admin-submit-save",
      ];

      for (const cls of requiredClasses) {
        assert.ok(css.includes(cls), `globals.css must contain '${cls}'`);
      }
    });

    it("should define mobile adaptations under @media (max-width: 640px)", () => {
      const css = fs.readFileSync(globalsCssPath, "utf-8");
      const media640Idx = css.indexOf("@media (max-width: 640px)");
      assert.ok(media640Idx !== -1, "Must contain @media (max-width: 640px)");
      const mediaBlock = css.slice(media640Idx);

      assert.ok(mediaBlock.includes(".admin-directory-header"), "Mobile must stack directory header");
      assert.ok(mediaBlock.includes(".admin-pets-grid"), "Mobile must single-column pets grid");
      assert.ok(mediaBlock.includes(".btn-admin-submit-save"), "Mobile must full-width save button");
    });
  });
});
