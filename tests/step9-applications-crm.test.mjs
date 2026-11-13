import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadApplicationsAction } from "./helpers/application-action-loader.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

describe("Step 9: Adoption Applications CRM & Activity Logs Suite", () => {
  let actionsModule = null;
  let cleanup = null;

  before(async () => {
    const loaded = await loadApplicationsAction(projectRoot);
    actionsModule = loaded.actionModule;
    cleanup = loaded.cleanup;
  });

  after(() => {
    if (cleanup) cleanup();
  });

  describe("1. Server Actions Validation & Query Mechanics", () => {
    test("should export required server actions", () => {
      assert.equal(typeof actionsModule.getAdminApplications, "function");
      assert.equal(typeof actionsModule.updateApplicationStatus, "function");
      assert.equal(typeof actionsModule.saveApplicationNotes, "function");
      assert.equal(typeof actionsModule.getActivityLogs, "function");
    });

    test("should fetch applications and accurately compute status metrics", async () => {
      const res = await actionsModule.getAdminApplications("all", "");
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.applications));
      assert.ok(res.applications.length > 0, "Should have applications");

      assert.ok(res.metrics);
      assert.equal(res.metrics.total, res.applications.length);
      assert.ok(typeof res.metrics.newCount === "number");
      assert.ok(typeof res.metrics.underReviewCount === "number");
      assert.ok(typeof res.metrics.interviewCount === "number");
      assert.ok(typeof res.metrics.approvedCount === "number");
    });

    test("should filter applications by status tab correctly", async () => {
      const resNew = await actionsModule.getAdminApplications("new", "");
      assert.equal(resNew.success, true);
      resNew.applications.forEach((app) => {
        assert.equal(app.status, "new");
      });

      const resApproved = await actionsModule.getAdminApplications("approved", "");
      assert.equal(resApproved.success, true);
      resApproved.applications.forEach((app) => {
        assert.equal(app.status, "approved");
      });
    });

    test("should filter applications by search query across applicant name, pet, and location", async () => {
      const resByName = await actionsModule.getAdminApplications("all", "Priya");
      assert.equal(resByName.success, true);
      assert.ok(resByName.applications.length > 0);
      assert.ok(
        resByName.applications.some((a) => a.applicant_name.toLowerCase().includes("priya"))
      );

      const resByCode = await actionsModule.getAdminApplications("all", "#D01");
      assert.equal(resByCode.success, true);
      assert.ok(resByCode.applications.length > 0);
      assert.ok(
        resByCode.applications.some((a) => a.pet_code === "#D01")
      );

      const resByCity = await actionsModule.getAdminApplications("all", "Yelahanka");
      assert.equal(resByCity.success, true);
      assert.ok(resByCity.applications.length > 0);
      assert.ok(
        resByCity.applications.some((a) => a.city.toLowerCase().includes("yelahanka"))
      );
    });

    test("should validate updateApplicationStatus input parameters", async () => {
      // Missing ID
      const missingIdRes = await actionsModule.updateApplicationStatus("", "approved");
      assert.equal(missingIdRes.success, false);
      assert.ok(missingIdRes.error?.includes("required"));

      // Invalid status
      const invalidStatusRes = await actionsModule.updateApplicationStatus(
        "app-101",
        "non_existent_status"
      );
      assert.equal(invalidStatusRes.success, false);
      assert.ok(invalidStatusRes.error?.includes("Invalid status"));

      // Valid update
      const validRes = await actionsModule.updateApplicationStatus(
        "app-101",
        "under_review",
        "Checked phone screening."
      );
      assert.equal(validRes.success, true);
    });

    test("should validate saveApplicationNotes input parameters", async () => {
      const missingIdRes = await actionsModule.saveApplicationNotes("", "Some note");
      assert.equal(missingIdRes.success, false);

      const validRes = await actionsModule.saveApplicationNotes(
        "app-101",
        "Verified compound fence height."
      );
      assert.equal(validRes.success, true);
    });

    test("should fetch organizational activity logs with valid structures", async () => {
      const logs = await actionsModule.getActivityLogs(10);
      assert.ok(Array.isArray(logs));
      assert.ok(logs.length > 0);

      const firstLog = logs[0];
      assert.ok(firstLog.id);
      assert.ok(firstLog.admin_email);
      assert.ok(firstLog.action);
      assert.ok(firstLog.details);
      assert.ok(firstLog.created_at);
    });
  });

  describe("2. UI Component & Page Route Auditing", () => {
    test("should verify /admin/applications/page.tsx route exists with dynamic rendering", () => {
      const pagePath = path.join(projectRoot, "src", "app", "admin", "applications", "page.tsx");
      assert.ok(fs.existsSync(pagePath), "page.tsx must exist");
      const content = fs.readFileSync(pagePath, "utf-8");
      assert.ok(content.includes('export const dynamic = "force-dynamic"'));
      assert.ok(content.includes("AdminApplicationsClient"));
      assert.ok(content.includes("AdminHeader"));
      assert.ok(content.includes('activeTab="applications"'));
    });

    test("should verify AdminApplicationsClient component implementation", () => {
      const componentPath = path.join(
        projectRoot,
        "src",
        "components",
        "AdminApplicationsClient.tsx"
      );
      assert.ok(fs.existsSync(componentPath), "AdminApplicationsClient.tsx must exist");
      const content = fs.readFileSync(componentPath, "utf-8");

      // Verify search & tabs
      assert.ok(content.includes("admin-search-input"));
      assert.ok(content.includes("admin-status-tabs"));
      assert.ok(content.includes("New Inquiries"));
      assert.ok(content.includes("Meet & Greet"));

      // Verify contact shortcuts
      assert.ok(content.includes("btn-shortcut wa"));
      assert.ok(content.includes("btn-shortcut tel"));
      assert.ok(content.includes("btn-shortcut email"));
      assert.ok(content.includes("https://wa.me/"));

      // Verify screening modal & sections
      assert.ok(content.includes("screening-modal-card"));
      assert.ok(content.includes("status-button-group"));
      assert.ok(content.includes("btn-pipeline"));
      assert.ok(content.includes("add-note-box"));
      assert.ok(content.includes("btn-save-note"));

      // Verify activity drawer
      assert.ok(content.includes("activity-drawer-card"));
      assert.ok(content.includes("activity-feed-list"));
    });

    test("should verify AdminHeader links to /admin/applications", () => {
      const headerPath = path.join(projectRoot, "src", "components", "AdminHeader.tsx");
      const content = fs.readFileSync(headerPath, "utf-8");
      assert.ok(content.includes('href="/admin/applications"'));
      assert.ok(content.includes("Applications"));
    });
  });

  describe("3. CSS Styling & Mobile Responsive Verification", () => {
    test("should define essential CRM and modal styling rules in globals.css", () => {
      const cssPath = path.join(projectRoot, "src", "app", "globals.css");
      const css = fs.readFileSync(cssPath, "utf-8");

      assert.ok(css.includes(".admin-applications-manager"));
      assert.ok(css.includes(".admin-applications-grid"));
      assert.ok(css.includes(".admin-app-card"));
      assert.ok(css.includes(".btn-shortcut.wa"));
      assert.ok(css.includes(".btn-review-details"));
      assert.ok(css.includes(".screening-modal-card"));
      assert.ok(css.includes(".status-pill.status-new"));
      assert.ok(css.includes(".status-pill.status-under_review"));
      assert.ok(css.includes(".status-pill.status-interview"));
      assert.ok(css.includes(".status-pill.status-meet_and_greet"));
      assert.ok(css.includes(".status-pill.status-approved"));
      assert.ok(css.includes(".activity-feed-list"));
    });

    test("should define responsive mobile adaptations for applications under max-width: 640px", () => {
      const cssPath = path.join(projectRoot, "src", "app", "globals.css");
      const css = fs.readFileSync(cssPath, "utf-8");

      assert.ok(css.includes("/* Step 9: Applications CRM Mobile Adaptations */"));
      assert.ok(css.includes(".admin-applications-grid"));
      assert.ok(css.includes(".btn-shortcut"));
      assert.ok(css.includes(".screening-modal-card"));
      assert.ok(css.includes(".status-button-group"));
    });
  });
});
