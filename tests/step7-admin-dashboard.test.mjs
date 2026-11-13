import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAuthAction } from "./helpers/auth-action-loader.mjs";
import { loadAdminDataModule } from "./helpers/admin-data-loader.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const middlewarePath = path.join(projectRoot, "src", "middleware.ts");
const adminPagePath = path.join(projectRoot, "src", "app", "admin", "page.tsx");
const adminLoginPagePath = path.join(projectRoot, "src", "app", "admin", "login", "page.tsx");
const adminLoginFormPath = path.join(projectRoot, "src", "components", "AdminLoginForm.tsx");
const adminHeaderPath = path.join(projectRoot, "src", "components", "AdminHeader.tsx");
const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");

describe("Step 7: Single-Admin Login & Overview Dashboard Suite", () => {
  let authModule = null;
  let adminDataModule = null;
  let cleanupAuth = null;
  let cleanupAdminData = null;

  before(async () => {
    const loadedAuth = await loadAuthAction(projectRoot);
    authModule = loadedAuth;
    cleanupAuth = loadedAuth.cleanup;

    const loadedAdminData = await loadAdminDataModule(projectRoot);
    adminDataModule = loadedAdminData;
    cleanupAdminData = loadedAdminData.cleanup;
  });

  after(() => {
    if (typeof cleanupAuth === "function") cleanupAuth();
    if (typeof cleanupAdminData === "function") cleanupAdminData();
  });

  // =========================================================================
  // 1. Auth Server Actions Validation & Security Mechanics
  // =========================================================================
  describe("1. Admin Auth Server Action Validation & Mechanics", () => {
    it("should export signInAdmin, signOutAdmin, and getCurrentAdmin functions", () => {
      assert.equal(typeof authModule.mod.signInAdmin, "function");
      assert.equal(typeof authModule.mod.signOutAdmin, "function");
      assert.equal(typeof authModule.mod.getCurrentAdmin, "function");
    });

    it("should reject sign in with missing or invalid email format", async () => {
      const invalidEmails = ["", "invalid-email", "admin@", "@havenpaws.org", "   "];
      for (const email of invalidEmails) {
        const formData = new FormData();
        formData.set("email", email);
        formData.set("password", "SecurePassword123!");
        const res = await authModule.mod.signInAdmin(null, formData);
        assert.equal(res.success, false);
        assert.match(res.error, /valid admin email/i);
      }
    });

    it("should reject sign in with missing or short password (< 6 chars)", async () => {
      const shortPasswords = ["", "123", "abcde", "     "];
      for (const pwd of shortPasswords) {
        const formData = new FormData();
        formData.set("email", "admin@havenpaws.org");
        formData.set("password", pwd);
        const res = await authModule.mod.signInAdmin(null, formData);
        assert.equal(res.success, false);
        assert.match(res.error, /password.*6 characters/i);
      }
    });

    it("should return helpful error message when Supabase client is not configured", async () => {
      authModule.setMockClient(null);
      const formData = new FormData();
      formData.set("email", "admin@havenpaws.org");
      formData.set("password", "SecurePass123");
      const res = await authModule.mod.signInAdmin(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /Supabase connection is not configured/i);
    });

    it("should handle invalid login credentials from Supabase gracefully", async () => {
      const mockClient = {
        auth: {
          signInWithPassword: async () => ({
            data: { user: null },
            error: { message: "Invalid login credentials" },
          }),
        },
      };
      authModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("email", "admin@havenpaws.org");
      formData.set("password", "WrongPassword123");
      const res = await authModule.mod.signInAdmin(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /Invalid email or password/i);
    });

    it("should redirect to /admin on successful authentication", async () => {
      const mockClient = {
        auth: {
          signInWithPassword: async () => ({
            data: { user: { id: "admin-uid-123", email: "admin@havenpaws.org" } },
            error: null,
          }),
        },
      };
      authModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("email", "admin@havenpaws.org");
      formData.set("password", "CorrectPassword123");

      await assert.rejects(
        async () => {
          await authModule.mod.signInAdmin(null, formData);
        },
        (err) => {
          return err.message.includes("NEXT_REDIRECT: /admin");
        }
      );
    });

    it("should handle signOutAdmin and redirect to /admin/login", async () => {
      let signedOut = false;
      const mockClient = {
        auth: {
          signOut: async () => {
            signedOut = true;
            return { error: null };
          },
        },
      };
      authModule.setMockClient(mockClient);

      await assert.rejects(
        async () => {
          await authModule.mod.signOutAdmin();
        },
        (err) => {
          assert.equal(signedOut, true, "signOut must be called on Supabase client");
          return err.message.includes("NEXT_REDIRECT: /admin/login");
        }
      );
    });

    it("should return null from getCurrentAdmin when unauthenticated or error", async () => {
      authModule.setMockClient(null);
      const res1 = await authModule.mod.getCurrentAdmin();
      assert.equal(res1, null);

      const mockClientWithError = {
        auth: {
          getUser: async () => ({ data: { user: null }, error: new Error("Session expired") }),
        },
      };
      authModule.setMockClient(mockClientWithError);
      const res2 = await authModule.mod.getCurrentAdmin();
      assert.equal(res2, null);
    });

    it("should return user info from getCurrentAdmin when authenticated", async () => {
      const mockClient = {
        auth: {
          getUser: async () => ({
            data: { user: { id: "user-456", email: "shelter-admin@havenpaws.org" } },
            error: null,
          }),
        },
      };
      authModule.setMockClient(mockClient);
      const res = await authModule.mod.getCurrentAdmin();
      assert.deepEqual(res, {
        id: "user-456",
        email: "shelter-admin@havenpaws.org",
      });
    });
  });

  // =========================================================================
  // 2. Admin Dashboard Data Query Layer
  // =========================================================================
  describe("2. Admin Dashboard Data Query Layer", () => {
    it("should export getAdminDashboardData async function", () => {
      assert.equal(typeof adminDataModule.mod.getAdminDashboardData, "function");
    });

    it("should return valid fallback data when Supabase is unavailable", async () => {
      adminDataModule.setMockClient(null);
      const data = await adminDataModule.mod.getAdminDashboardData();

      assert.ok(data.stats, "Must contain stats object");
      assert.equal(typeof data.stats.totalPets, "number");
      assert.equal(typeof data.stats.availablePets, "number");
      assert.equal(typeof data.stats.totalApplications, "number");
      assert.equal(typeof data.stats.newApplications, "number");
      assert.equal(typeof data.stats.adoptedCount, "number");

      assert.ok(data.stats.totalPets >= 9, "Total pets fallback should reflect catalog");
      assert.ok(Array.isArray(data.recentPets), "recentPets must be an array");
      assert.ok(data.recentPets.length > 0, "recentPets must have items");
      assert.ok(Array.isArray(data.recentApplications), "recentApplications must be an array");
    });

    it("should parse and compute live database metrics accurately", async () => {
      const mockPets = [
        { id: "p1", slug: "rocky", name: "Rocky", adoption_code: "#D01", species: "Dog", breed: "Indie Mix", status: "available", image: "/images/1.jpeg", created_at: "2026-01-01" },
        { id: "p2", slug: "cleo", name: "Cleo", adoption_code: "#C02", species: "Cat", breed: "Calico", status: "available", image: "/images/2.jpeg", created_at: "2026-01-02" },
        { id: "p3", slug: "milo", name: "Milo", adoption_code: "#D03", species: "Dog", breed: "Golden", status: "adopted", image: "/images/3.jpeg", created_at: "2026-01-03" },
      ];

      const mockApps = [
        { id: "a1", pet_name: "Rocky", pet_code: "#D01", applicant_name: "Anita", applicant_phone: "+91 98765 43210", city: "Bangalore", status: "new", created_at: "2026-02-01" },
        { id: "a2", pet_name: "Cleo", pet_code: "#C02", applicant_name: "Vikram", applicant_phone: "+91 91234 56789", city: "Bangalore", status: "approved", created_at: "2026-02-02" },
      ];

      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              select: () => ({
                order: () => Promise.resolve({ data: mockPets, error: null }),
              }),
            };
          }
          if (table === "adoption_applications") {
            return {
              select: (cols, opts) => {
                if (opts?.count === "exact") {
                  return Promise.resolve({ data: [{ status: "new" }, { status: "approved" }], count: 2, error: null });
                }
                return {
                  order: () => ({
                    limit: () => Promise.resolve({ data: mockApps, error: null }),
                  }),
                };
              },
            };
          }
          if (table === "adoption_records") {
            return {
              select: () => Promise.resolve({ count: 5, error: null }),
            };
          }
          return { select: () => Promise.resolve({ data: [], error: null }) };
        },
      };

      adminDataModule.setMockClient(mockClient);
      const data = await adminDataModule.mod.getAdminDashboardData();

      assert.equal(data.stats.totalPets, 3);
      assert.equal(data.stats.availablePets, 2);
      assert.equal(data.stats.adoptedCount, 6); // 1 adopted pet in pets + 5 in adoption_records
      assert.equal(data.stats.totalApplications, 2);
      assert.equal(data.stats.newApplications, 1);

      assert.equal(data.recentPets.length, 3);
      assert.equal(data.recentPets[0].name, "Rocky");
      assert.equal(data.recentPets[0].adoptionCode, "#D01");

      assert.equal(data.recentApplications.length, 2);
      assert.equal(data.recentApplications[0].applicantName, "Anita");
    });
  });

  // =========================================================================
  // 3. Middleware Route Protection Auditing
  // =========================================================================
  describe("3. Middleware Route Protection Auditing", () => {
    it("should have src/middleware.ts present with Next.js middleware configuration", () => {
      assert.ok(fs.existsSync(middlewarePath), "src/middleware.ts must exist");
      const code = fs.readFileSync(middlewarePath, "utf-8");

      assert.ok(code.includes("export async function middleware"), "Must export async middleware function");
      assert.ok(code.includes("export const config"), "Must export middleware config");
      assert.ok(code.includes("/admin/:path*"), "Config matcher must target /admin/:path*");
    });

    it("should contain unauthenticated and authenticated redirect rules in middleware", () => {
      const code = fs.readFileSync(middlewarePath, "utf-8");

      // Redirect from /admin/login to /admin if logged in
      assert.ok(
        code.includes("/admin/login") && code.includes("/admin"),
        "Must handle login page session redirect"
      );

      // Redirect from /admin/* to /admin/login if logged out
      assert.ok(
        code.includes("loginUrl") || code.includes("/admin/login"),
        "Must redirect unauthenticated traffic to /admin/login"
      );
    });
  });

  // =========================================================================
  // 4. Admin UI Components & Dashboard Layout Auditing
  // =========================================================================
  describe("4. Admin UI Components & Dashboard Layout Auditing", () => {
    it("should have AdminLoginForm component with semantic form fields and action state", () => {
      assert.ok(fs.existsSync(adminLoginFormPath), "AdminLoginForm.tsx must exist");
      const code = fs.readFileSync(adminLoginFormPath, "utf-8");

      assert.ok(code.includes('"use client"'), "Must be client component for form interactivity");
      assert.ok(code.includes("useActionState"), "Must use React useActionState");
      assert.ok(code.includes("signInAdmin"), "Must wire signInAdmin action");
      assert.ok(code.includes('type="email"'), "Must have email input");
      assert.ok(code.includes('type="password"'), "Must have password input");
      assert.ok(code.includes("isPending"), "Must handle isPending loading state");
      assert.ok(code.includes("admin-error-banner"), "Must display error banner when state.error is present");
    });

    it("should have AdminHeader component with branding, navigation, and logout", () => {
      assert.ok(fs.existsSync(adminHeaderPath), "AdminHeader.tsx must exist");
      const code = fs.readFileSync(adminHeaderPath, "utf-8");

      assert.ok(code.includes("signOutAdmin"), "Must include signOutAdmin action");
      assert.ok(code.includes("/admin"), "Must link to /admin");
      assert.ok(code.includes("/admin/pets"), "Must link to /admin/pets");
      assert.ok(code.includes("/admin/applications"), "Must link to /admin/applications");
      assert.ok(code.includes("One Org • Single Admin"), "Must highlight single admin organizational context");
      assert.ok(code.includes("adminEmail"), "Must render current admin email");
    });

    it("should have AdminDashboardPage rendering 4 live KPI cards and 2 overview sections", () => {
      assert.ok(fs.existsSync(adminPagePath), "src/app/admin/page.tsx must exist");
      const code = fs.readFileSync(adminPagePath, "utf-8");

      assert.ok(code.includes("getAdminDashboardData"), "Must fetch dashboard data");
      assert.ok(code.includes("getCurrentAdmin"), "Must check current admin session");
      assert.ok(code.includes("Total Rescues in Care"), "Must show KPI: Total Rescues in Care");
      assert.ok(code.includes("Available for Adoption"), "Must show KPI: Available for Adoption");
      assert.ok(code.includes("Adoption Applications"), "Must show KPI: Adoption Applications");
      assert.ok(code.includes("Forever Homes Placed"), "Must show KPI: Forever Homes Placed");
      assert.ok(code.includes("Recent Adoption Inquiries"), "Must have Recent Applications section");
      assert.ok(code.includes("Rescue Companions"), "Must have Recent Pets section");
      assert.ok(code.includes("admin-kpi-grid"), "Must use admin-kpi-grid class");
    });

    it("should have AdminLoginPage rendering the login form", () => {
      assert.ok(fs.existsSync(adminLoginPagePath), "src/app/admin/login/page.tsx must exist");
      const code = fs.readFileSync(adminLoginPagePath, "utf-8");

      assert.ok(code.includes("AdminLoginForm"), "Must render AdminLoginForm component");
      assert.ok(code.includes("admin-login-page"), "Must wrap with admin-login-page container");
    });
  });

  // =========================================================================
  // 5. CSS Styling & Responsive Design Auditing
  // =========================================================================
  describe("5. CSS Styling & Mobile Responsive Verification", () => {
    it("should define all essential admin styling rules in globals.css", () => {
      const css = fs.readFileSync(globalsCssPath, "utf-8");

      const requiredSelectors = [
        ".admin-page-wrapper",
        ".admin-header",
        ".admin-nav",
        ".admin-kpi-grid",
        ".admin-kpi-card",
        ".admin-sections-grid",
        ".admin-card",
        ".admin-table",
        ".admin-pets-list",
        ".admin-login-page",
        ".admin-login-card",
        ".btn-admin-submit",
      ];

      for (const selector of requiredSelectors) {
        assert.ok(css.includes(selector), `globals.css must contain '${selector}'`);
      }
    });

    it("should contain mobile and tablet responsive rules for admin layouts", () => {
      const css = fs.readFileSync(globalsCssPath, "utf-8");

      // Verify media query adaptations
      const media960Idx = css.indexOf("@media (max-width: 960px)");
      assert.ok(media960Idx !== -1, "Must contain @media (max-width: 960px)");
      const media960Block = css.slice(media960Idx);
      assert.ok(media960Block.includes(".admin-kpi-grid"), "960px breakpoint must adapt .admin-kpi-grid");
      assert.ok(media960Block.includes(".admin-sections-grid"), "960px breakpoint must adapt .admin-sections-grid");

      const media640Idx = css.indexOf("@media (max-width: 640px)");
      assert.ok(media640Idx !== -1, "Must contain @media (max-width: 640px)");
      const media640Block = css.slice(media640Idx);
      assert.ok(media640Block.includes(".admin-kpi-grid"), "640px breakpoint must adapt .admin-kpi-grid");
      assert.ok(media640Block.includes(".admin-login-card"), "640px breakpoint must adapt .admin-login-card");
      assert.ok(media640Block.includes(".admin-nav"), "640px breakpoint must adapt .admin-nav for mobile scroll");
    });
  });
});
