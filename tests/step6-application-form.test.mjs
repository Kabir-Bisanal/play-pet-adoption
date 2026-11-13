import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAdoptionAction } from "./helpers/action-loader.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const applyPagePath = path.join(projectRoot, "src", "app", "apply", "page.tsx");
const formComponentPath = path.join(projectRoot, "src", "components", "AdoptionApplicationForm.tsx");
const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");
const petProfileClientPath = path.join(projectRoot, "src", "components", "PetProfileClient.tsx");

describe("Step 6: 12-Field Online Adoption Application Form Suite", () => {
  let submitAdoptionApplication = null;
  let cleanupAction = null;

  before(async () => {
    const loaded = await loadAdoptionAction(projectRoot);
    submitAdoptionApplication = loaded.mod.submitAdoptionApplication;
    cleanupAction = loaded.cleanup;
  });

  after(() => {
    if (typeof cleanupAction === "function") {
      cleanupAction();
    }
  });

  // =========================================================================
  // 1. Server Action Validation & Integrity
  // =========================================================================
  describe("1. Server Action Validation & Submission Mechanics", () => {
    it("should export submitAdoptionApplication async function", () => {
      assert.equal(typeof submitAdoptionApplication, "function");
    });

    it("should reject completely empty form submission with comprehensive field errors", async () => {
      const emptyData = new FormData();
      const result = await submitAdoptionApplication(null, emptyData);

      assert.equal(result.success, false);
      assert.ok(result.errors, "Must return errors object");
      assert.ok(result.errors.applicantName, "Must flag missing applicantName");
      assert.ok(result.errors.applicantEmail, "Must flag missing applicantEmail");
      assert.ok(result.errors.applicantPhone, "Must flag missing applicantPhone");
      assert.ok(result.errors.city, "Must flag missing city");
      assert.ok(result.errors.residenceType, "Must flag missing residenceType");
      assert.ok(result.errors.hasPetsCurrently, "Must flag missing hasPetsCurrently");
      assert.ok(result.errors.pastPetExperience, "Must flag missing pastPetExperience");
      assert.ok(result.errors.hoursAlone, "Must flag missing hoursAlone");
      assert.ok(result.errors.message, "Must flag missing message");
      assert.ok(result.errors.familyAgreement, "Must flag missing familyAgreement");
      assert.ok(result.errors.termsAccepted, "Must flag missing termsAccepted");
    });

    it("should reject malformed email addresses", async () => {
      const badEmails = ["notanemail", "user@", "@domain.com", "plainaddress", "user@domain..com"];
      for (const email of badEmails) {
        const formData = new FormData();
        formData.set("applicantName", "Test User");
        formData.set("applicantEmail", email);
        const result = await submitAdoptionApplication(null, formData);
        assert.equal(result.success, false);
        assert.ok(result.errors?.applicantEmail, `Email '${email}' should have been rejected`);
      }
    });

    it("should reject invalid / short phone numbers (< 10 digits)", async () => {
      const badPhones = ["123", "98765", "abcd", "+91 1234"];
      for (const phone of badPhones) {
        const formData = new FormData();
        formData.set("applicantName", "Test User");
        formData.set("applicantEmail", "user@test.com");
        formData.set("applicantPhone", phone);
        const result = await submitAdoptionApplication(null, formData);
        assert.equal(result.success, false);
        assert.ok(result.errors?.applicantPhone, `Phone '${phone}' should have been rejected`);
      }
    });

    it("should accept valid 10-digit Indian phone numbers with or without country code", async () => {
      const validPhones = ["9876543210", "+91 98765 43210", "+919876543210", "09876543210"];
      for (const phone of validPhones) {
        const formData = new FormData();
        formData.set("petSlug", "cleo");
        formData.set("petName", "Cleo");
        formData.set("petCode", "#C02");
        formData.set("applicantName", "Test Adopter");
        formData.set("applicantEmail", "adopter@example.com");
        formData.set("applicantPhone", phone);
        formData.set("city", "Sahakara Nagar, Bangalore");
        formData.set("residenceType", "Own Apartment");
        formData.set("hasPetsCurrently", "None currently");
        formData.set("pastPetExperience", "Have had cats previously");
        formData.set("familyAgreement", "on");
        formData.set("hoursAlone", "2 – 4 hours daily");
        formData.set("message", "We love Cleo and have a safe, netted balcony apartment.");
        formData.set("termsAccepted", "on");

        const result = await submitAdoptionApplication(null, formData);
        assert.equal(result.success, true, `Phone '${phone}' should be accepted`);
        assert.match(result.referenceCode || "", /^APP-\d{4}$/, "Must generate APP-XXXX reference code");
        assert.equal(result.petName, "Cleo");
        assert.equal(result.petCode, "#C02");
      }
    });
  });

  // =========================================================================
  // 2. Page & Form Component Structure
  // =========================================================================
  describe("2. Page & Form Component Architecture", () => {
    it("should verify /apply/page.tsx exists and is a valid Next.js Server Component", () => {
      assert.ok(fs.existsSync(applyPagePath), "src/app/apply/page.tsx must exist");
      const src = fs.readFileSync(applyPagePath, "utf-8");
      assert.match(src, /export\s+default\s+async\s+function\s+ApplyPage/, "Must export async ApplyPage component");
      assert.match(src, /export\s+const\s+metadata/, "Must export metadata for SEO");
      assert.match(src, /getPets\(\)/, "Must fetch pets dynamically via getPets()");
    });

    it("should verify AdoptionApplicationForm.tsx is a Client Component with all 12 fields", () => {
      assert.ok(fs.existsSync(formComponentPath), "src/components/AdoptionApplicationForm.tsx must exist");
      const src = fs.readFileSync(formComponentPath, "utf-8");
      assert.match(src, /^"use client";/, "Must have 'use client' directive");
      assert.match(src, /useActionState/, "Must use React useActionState hook for form state");

      // Verify all 12 fields are declared in form
      const fieldNames = [
        "petSlug",
        "petName",
        "petCode",
        "applicantName",
        "applicantEmail",
        "applicantPhone",
        "city",
        "residenceType",
        "hasPetsCurrently",
        "pastPetExperience",
        "hoursAlone",
        "message",
        "familyAgreement",
        "termsAccepted",
      ];

      for (const name of fieldNames) {
        assert.match(src, new RegExp(`name="${name}"`), `Form must contain input with name='${name}'`);
      }
    });

    it("should render application confirmation and WhatsApp referral on success", () => {
      const src = fs.readFileSync(formComponentPath, "utf-8");
      assert.match(src, /application-success-card/, "Must declare .application-success-card container");
      assert.match(src, /state\.referenceCode/, "Must display reference code");
      assert.match(src, /btn-success-wa/, "Must provide WhatsApp follow-up button");
    });
  });

  // =========================================================================
  // 3. Integration with Pet Profile CTA
  // =========================================================================
  describe("3. Pet Profile Integration (/adopt/[id])", () => {
    it("should provide .btn-apply-profile link to /apply?pet=${pet.id} in PetProfileClient.tsx", () => {
      const src = fs.readFileSync(petProfileClientPath, "utf-8");
      assert.match(
        src,
        /href=\{`\/apply\?pet=\$\{pet\.id\}`\}/,
        "PetProfileClient must link directly to /apply?pet=${pet.id}"
      );
      assert.match(src, /className="btn-apply-profile"/, "Must apply .btn-apply-profile class");
    });
  });

  // =========================================================================
  // 4. CSS Tokens & Mobile Responsiveness
  // =========================================================================
  describe("4. CSS Styling & Responsive Rules in globals.css", () => {
    const css = fs.readFileSync(globalsCssPath, "utf-8");

    it("should define .btn-apply-profile with brand styling", () => {
      assert.match(css, /\.btn-apply-profile\s*\{[^}]*background:\s*var\(--brand-coral\)/);
      assert.match(css, /\.btn-apply-profile:hover/);
    });

    it("should define form and success card layout classes", () => {
      assert.match(css, /\.apply-page-wrapper/);
      assert.match(css, /\.form-section/);
      assert.match(css, /\.form-input:focus/);
      assert.match(css, /\.application-success-card/);
      assert.match(css, /\.btn-success-wa/);
    });

    it("should define mobile adaptations in @media (max-width: 640px)", () => {
      const mobileBlock = css.split(/@media\s*\(\s*max-width\s*:\s*640px\s*\)/)[1];
      assert.ok(mobileBlock, "Must have mobile media query block");
      assert.match(mobileBlock, /\.btn-apply-profile\s*\{[^}]*width:\s*100%;/);
      assert.match(mobileBlock, /\.form-row-2\s*\{[^}]*grid-template-columns:\s*1fr;/);
      assert.match(mobileBlock, /\.form-input,\s*\.form-select,\s*\.form-textarea\s*\{[^}]*font-size:\s*16px;/);
    });
  });
});
