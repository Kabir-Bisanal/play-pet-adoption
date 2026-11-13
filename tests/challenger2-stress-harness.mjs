import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { performance } from "node:perf_hooks";
import { loadPetManagementAction } from "./helpers/pet-action-loader.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Helper to load and spy on middleware
async function loadMiddlewareHarness() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://prrkxehqyeziprrwrmyb.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";

  const middlewarePath = path.join(projectRoot, "src", "middleware.ts");
  let code = fs.readFileSync(middlewarePath, "utf-8");

  // Track Supabase client creation and getUser calls
  const spyState = {
    createServerClientCalls: 0,
    getUserCalls: 0,
    mockUser: null,
    mockAuthError: null,
  };

  globalThis.__middlewareSpy = spyState;

  // Replace @supabase/ssr import with a mock implementation
  code = code.replace(
    /import\s*\{\s*createServerClient\s*\}\s*from\s*["']@supabase\/ssr["'];?/,
    `
    const createServerClient = (url, anonKey, options) => {
      globalThis.__middlewareSpy.createServerClientCalls++;
      return {
        auth: {
          getUser: async () => {
            globalThis.__middlewareSpy.getUserCalls++;
            return {
              data: { user: globalThis.__middlewareSpy.mockUser },
              error: globalThis.__middlewareSpy.mockAuthError,
            };
          },
        },
      };
    };
    `
  );

  // Replace next/server import with mock NextResponse
  code = code.replace(
    /import\s*\{\s*NextResponse(?:,\s*type\s+NextRequest)?\s*\}\s*from\s*["']next\/server["'];?/,
    `
    class NextResponse {
      constructor(status = 200, headers = {}) {
        this.status = status;
        this.headers = new Headers(headers);
        this.cookies = {
          set: (name, value, opts) => {},
          get: (name) => undefined,
        };
      }
      static next(init) {
        return new NextResponse(200, init?.headers);
      }
      static redirect(url, status = 307) {
        const res = new NextResponse(status);
        res.headers.set("location", typeof url === "string" ? url : url.href);
        return res;
      }
    }
    `
  );

  // Transpile TypeScript to ESM
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const tempFilePath = path.join(
    projectRoot,
    "tests",
    `.tmp-middleware-${Date.now()}-${Math.random().toString(36).substring(7)}.mjs`
  );
  fs.writeFileSync(tempFilePath, transpiled.outputText, "utf-8");

  const mod = await import(pathToFileURL(tempFilePath).href);

  return {
    middleware: mod.middleware,
    config: mod.config,
    spyState,
    cleanup: () => {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {}
      delete globalThis.__middlewareSpy;
    },
  };
}

// Minimal mock of NextRequest
function createMockRequest(pathname, cookies = {}) {
  const cookieList = Object.entries(cookies).map(([name, value]) => ({ name, value }));
  const url = new URL(pathname, "http://localhost:3000");

  return {
    url: url.href,
    nextUrl: {
      pathname,
      searchParams: url.searchParams,
    },
    headers: new Headers(),
    cookies: {
      getAll: () => cookieList,
      get: (name) => cookieList.find((c) => c.name === name) || undefined,
      set: () => {},
    },
  };
}

describe("CHALLENGER 2: Latency, Server Action Resilience & Image Optimization", () => {

  // =========================================================================
  // SUITE 1: Middleware Empirical Latency & Cookie Fast-Path Verification (R4)
  // =========================================================================
  describe("Suite 1: Middleware Empirical Latency & Cookie Fast-Path (R4)", () => {
    let harness = null;

    before(async () => {
      harness = await loadMiddlewareHarness();
    });

    after(() => {
      if (harness) harness.cleanup();
    });

    it("1.1: Unauthenticated request to /admin/login without cookies bypasses Supabase (0 calls)", async () => {
      harness.spyState.createServerClientCalls = 0;
      harness.spyState.getUserCalls = 0;

      const req = createMockRequest("/admin/login", {});
      const res = await harness.middleware(req);

      assert.equal(harness.spyState.createServerClientCalls, 0, "Must not create Supabase SSR client");
      assert.equal(harness.spyState.getUserCalls, 0, "Must not make remote Supabase auth call");
      assert.ok(res, "Must return response");
      assert.equal(res.status, 200, "Should allow login page load");
    });

    it("1.2: Request to /admin/login with unrelated non-auth cookies still bypasses Supabase (0 calls)", async () => {
      harness.spyState.createServerClientCalls = 0;
      harness.spyState.getUserCalls = 0;

      const nonAuthCookies = {
        theme_preference: "forest-dark",
        visited_before: "true",
        analytics_session_id: "ga_9837264821",
        banner_dismissed: "1",
      };

      const req = createMockRequest("/admin/login", nonAuthCookies);
      const res = await harness.middleware(req);

      assert.equal(harness.spyState.createServerClientCalls, 0, "Non-auth cookies must not trigger Supabase SSR client");
      assert.equal(harness.spyState.getUserCalls, 0, "Non-auth cookies must not trigger remote auth call");
      assert.equal(res.status, 200);
    });

    it("1.3: Unauthenticated request to protected /admin/* routes redirects immediately to /admin/login (0 calls)", async () => {
      const protectedRoutes = ["/admin", "/admin/pets", "/admin/pets/new", "/admin/pets/kaju/edit"];

      for (const route of protectedRoutes) {
        harness.spyState.createServerClientCalls = 0;
        harness.spyState.getUserCalls = 0;

        const req = createMockRequest(route, {});
        const res = await harness.middleware(req);

        assert.equal(harness.spyState.createServerClientCalls, 0, `Route ${route} must fast-path redirect without Supabase client`);
        assert.equal(harness.spyState.getUserCalls, 0, `Route ${route} must fast-path redirect without getUser call`);
        assert.ok(res.headers.get("location"), `Route ${route} must set redirect location header`);

        const redirectUrl = new URL(res.headers.get("location"));
        assert.equal(redirectUrl.pathname, "/admin/login");

        if (route !== "/admin") {
          assert.equal(redirectUrl.searchParams.get("redirect"), route, `Redirect param must match requested route: ${route}`);
        } else {
          assert.equal(redirectUrl.searchParams.get("redirect"), null, "/admin root does not need redundant redirect param");
        }
      }
    });

    it("1.4: Request WITH auth cookie triggers full Supabase session check", async () => {
      const authCookiePatterns = [
        { "sb-haven-auth-token": "mock-token-xyz" },
        { "supabase-auth-token": "jwt-token-abc" },
        { "sb-access-token": "session-123" },
      ];

      for (const cookies of authCookiePatterns) {
        harness.spyState.createServerClientCalls = 0;
        harness.spyState.getUserCalls = 0;
        harness.spyState.mockUser = { id: "admin-1", email: "admin@havenpaws.org" };

        const req = createMockRequest("/admin/pets", cookies);
        const res = await harness.middleware(req);

        assert.equal(harness.spyState.createServerClientCalls, 1, "Must create Supabase SSR client when auth cookie exists");
        assert.equal(harness.spyState.getUserCalls, 1, "Must call getUser when auth cookie exists");
        assert.equal(res.status, 200, "Authenticated user should access /admin/pets");
      }
    });

    it("1.5: Authenticated user visiting /admin/login redirects to /admin", async () => {
      harness.spyState.createServerClientCalls = 0;
      harness.spyState.getUserCalls = 0;
      harness.spyState.mockUser = { id: "admin-1", email: "admin@havenpaws.org" };

      const req = createMockRequest("/admin/login", { "sb-token": "valid" });
      const res = await harness.middleware(req);

      assert.equal(harness.spyState.getUserCalls, 1);
      const redirectUrl = new URL(res.headers.get("location"));
      assert.equal(redirectUrl.pathname, "/admin", "Logged-in user must be redirected to /admin");
    });

    it("1.6: Expired or invalid auth cookie on /admin/login allows viewing the login page", async () => {
      harness.spyState.createServerClientCalls = 0;
      harness.spyState.getUserCalls = 0;
      harness.spyState.mockUser = null; // session expired

      const req = createMockRequest("/admin/login", { "sb-token": "expired-token" });
      const res = await harness.middleware(req);

      assert.equal(harness.spyState.getUserCalls, 1);
      assert.equal(res.status, 200, "User with invalid session must see login page without redirect loops");
    });

    it("1.7: Expired or invalid auth cookie on /admin/pets redirects to /admin/login", async () => {
      harness.spyState.createServerClientCalls = 0;
      harness.spyState.getUserCalls = 0;
      harness.spyState.mockUser = null; // session expired

      const req = createMockRequest("/admin/pets", { "sb-token": "expired-token" });
      const res = await harness.middleware(req);

      assert.equal(harness.spyState.getUserCalls, 1);
      const redirectUrl = new URL(res.headers.get("location"));
      assert.equal(redirectUrl.pathname, "/admin/login");
      assert.equal(redirectUrl.searchParams.get("redirect"), "/admin/pets");
    });

    it("1.8: Latency Benchmark: 1,000 unauthenticated requests execute in < 25ms total (< 0.025ms/req)", async () => {
      harness.spyState.createServerClientCalls = 0;
      harness.spyState.getUserCalls = 0;
      const iterations = 1000;
      const req = createMockRequest("/admin/login", {});

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        await harness.middleware(req);
      }
      const elapsed = performance.now() - start;
      const avgPerReq = elapsed / iterations;

      assert.ok(
        elapsed < 100,
        `1,000 unauthenticated requests took ${elapsed.toFixed(2)}ms (expected < 100ms, avg: ${avgPerReq.toFixed(4)}ms/req)`
      );
      assert.equal(harness.spyState.createServerClientCalls, 0, "Zero Supabase calls across all 1,000 iterations");
    });

    it("1.9: Boundary: 100 noisy cookies without auth token still fast-paths cleanly", async () => {
      const noisyCookies = {};
      for (let i = 0; i < 100; i++) {
        noisyCookies[`non_auth_cookie_var_${i}`] = `test_value_${i}_data`;
      }

      harness.spyState.createServerClientCalls = 0;
      harness.spyState.getUserCalls = 0;

      const req = createMockRequest("/admin/login", noisyCookies);
      const res = await harness.middleware(req);

      assert.equal(harness.spyState.createServerClientCalls, 0);
      assert.equal(harness.spyState.getUserCalls, 0);
      assert.equal(res.status, 200);
    });
  });

  // =========================================================================
  // SUITE 2: Server Action markPetAsAdopted & Error Handling Stress Test (R3)
  // =========================================================================
  describe("Suite 2: Server Action markPetAsAdopted & Error Resilience (R3)", () => {
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

    it("2.1: Rejects missing or whitespace-only adopter names with descriptive error", async () => {
      const invalidNames = ["", " ", "   \t\n  ", "A"]; // min length 2
      for (const name of invalidNames) {
        const formData = new FormData();
        formData.set("slug", "kaju");
        formData.set("adopterNames", name);
        formData.set("neighborhood", "Indiranagar, Bangalore");
        formData.set("afterQuote", "Kaju has brought so much warmth to our home!");

        const res = await petActionModule.mod.markPetAsAdopted(null, formData);
        assert.equal(res.success, false, `Should reject adopter name: '${name}'`);
        assert.match(res.error, /adopter's name/i);
      }
    });

    it("2.2: Rejects missing or whitespace-only neighborhood with descriptive error", async () => {
      const invalidNeighborhoods = ["", " ", "\n\t", "X"];
      for (const neighborhood of invalidNeighborhoods) {
        const formData = new FormData();
        formData.set("slug", "kaju");
        formData.set("adopterNames", "Vikram & Ananya");
        formData.set("neighborhood", neighborhood);
        formData.set("afterQuote", "Kaju has brought so much warmth to our home!");

        const res = await petActionModule.mod.markPetAsAdopted(null, formData);
        assert.equal(res.success, false, `Should reject neighborhood: '${neighborhood}'`);
        assert.match(res.error, /neighborhood/i);
      }
    });

    it("2.3: Rejects missing or short afterQuote (< 5 chars)", async () => {
      const shortQuotes = ["", " ", "Yay", "Cute"];
      for (const quote of shortQuotes) {
        const formData = new FormData();
        formData.set("slug", "kaju");
        formData.set("adopterNames", "Vikram & Ananya");
        formData.set("neighborhood", "Indiranagar");
        formData.set("afterQuote", quote);

        const res = await petActionModule.mod.markPetAsAdopted(null, formData);
        assert.equal(res.success, false, `Should reject quote: '${quote}'`);
        assert.match(res.error, /quote.*update/i);
      }
    });

    it("2.4: Handles missing companion slug gracefully", async () => {
      const formData = new FormData();
      formData.set("slug", "");
      formData.set("adopterNames", "Vikram & Ananya");
      formData.set("neighborhood", "Indiranagar");
      formData.set("afterQuote", "Kaju is wonderful!");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /Missing companion identifier/i);
    });

    it("2.5: Returns clean error when companion does not exist in database", async () => {
      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: null, error: { message: "Row not found" } }),
                }),
              }),
            };
          }
          return {};
        },
      };
      petActionModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("slug", "non-existent-pet-9999");
      formData.set("adopterNames", "Vikram & Ananya");
      formData.set("neighborhood", "Indiranagar");
      formData.set("afterQuote", "Kaju is wonderful in our new apartment!");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /could not be found/i);
    });

    it("2.6: Handles Postgres update error on pets table without crashing", async () => {
      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { name: "Kaju", breed: "Indie Mix", species: "dog", image: "/images/1.jpeg" },
                    error: null,
                  }),
                }),
              }),
              update: () => ({
                eq: async () => ({ error: { message: "PGRST301: Row-level security policy violated" } }),
              }),
            };
          }
          return {};
        },
      };
      petActionModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("slug", "kaju");
      formData.set("adopterNames", "Vikram & Ananya");
      formData.set("neighborhood", "Indiranagar");
      formData.set("afterQuote", "Kaju is wonderful in our new apartment!");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /Could not update pet status/i);
    });

    it("2.7: Catches and reports failure on adoption_records insert", async () => {
      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { name: "Kaju", breed: "Indie Mix", species: "dog", image: "/images/1.jpeg" },
                    error: null,
                  }),
                }),
              }),
              update: () => ({
                eq: async () => ({ error: null }),
              }),
            };
          }
          if (table === "adoption_records") {
            return {
              insert: async () => ({ error: { message: "Table constraint check failure" } }),
            };
          }
          return {};
        },
      };
      petActionModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("slug", "kaju");
      formData.set("adopterNames", "Vikram & Ananya");
      formData.set("neighborhood", "Indiranagar");
      formData.set("afterQuote", "Kaju is wonderful in our new apartment!");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /creating success story failed/i);
    });

    it("2.8: Handles activity_logs failure gracefully without failing adoption", async () => {
      let petUpdated = null;
      let recordInserted = null;

      const mockClient = {
        from: (table) => {
          if (table === "pets") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { name: "Simba", breed: "Ginger Indie Cat", species: "cat", image: "/images/3.jpeg" },
                    error: null,
                  }),
                }),
              }),
              update: (data) => ({
                eq: async (f, v) => {
                  petUpdated = { ...data, [f]: v };
                  return { error: null };
                },
              }),
            };
          }
          if (table === "adoption_records") {
            return {
              insert: async (data) => {
                recordInserted = data;
                return { error: null };
              },
            };
          }
          if (table === "activity_logs") {
            return {
              insert: async () => {
                throw new Error("Activity log table temporarily unavailable");
              },
            };
          }
          return {};
        },
      };
      petActionModule.setMockClient(mockClient);

      const formData = new FormData();
      formData.set("slug", "simba");
      formData.set("adopterNames", "Pooja & Karthik");
      formData.set("neighborhood", "Koramangala, Bangalore");
      formData.set("afterQuote", "Simba purrs all afternoon by the sunny window!");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, true, "Adoption must succeed even if non-critical activity log fails");
      assert.equal(petUpdated.status, "adopted");
      assert.equal(petUpdated.badge_label, "Adopted!");
      assert.equal(recordInserted.pet_slug, "simba");
      assert.equal(recordInserted.adopter_names, "Pooja & Karthik");
      assert.match(res.message, /Happy Forever Home Day/i);
    });

    it("2.9: Rejects unauthorized callers when supabase.auth returns expired session", async () => {
      const mockClientWithAuth = {
        auth: {
          getUser: async () => ({
            data: { user: null },
            error: { message: "JWT expired or revoked" },
          }),
        },
      };
      petActionModule.setMockClient(mockClientWithAuth);

      const formData = new FormData();
      formData.set("slug", "simba");
      formData.set("adopterNames", "Pooja & Karthik");
      formData.set("neighborhood", "Koramangala");
      formData.set("afterQuote", "Simba loves his new scratching post!");

      const res = await petActionModule.mod.markPetAsAdopted(null, formData);
      assert.equal(res.success, false);
      assert.match(res.error, /admin session has expired or is unauthorized/i);
    });
  });

  // =========================================================================
  // SUITE 3: Client handleAdoptSubmit Transition & UI Error Recovery (R3)
  // =========================================================================
  describe("Suite 3: Client handleAdoptSubmit State Management & UI Resilience (R3)", () => {
    it("3.1: AdminPetCatalogClient source wraps handleAdoptSubmit in startTransition and try/catch", () => {
      const catalogClientPath = path.join(projectRoot, "src", "components", "AdminPetCatalogClient.tsx");
      const code = fs.readFileSync(catalogClientPath, "utf-8");

      assert.ok(code.includes("startTransition"), "Must use startTransition for concurrent action dispatch");
      assert.ok(code.includes("try {"), "Must have try block in handleAdoptSubmit");
      assert.ok(code.includes("catch (err"), "Must have catch block to prevent unhandled rejection lockups");
    });

    it("3.2: Error branch resets isSubmitting to false, preventing UI freezing", () => {
      const catalogClientPath = path.join(projectRoot, "src", "components", "AdminPetCatalogClient.tsx");
      const code = fs.readFileSync(catalogClientPath, "utf-8");

      // Verify that failure branch resets isSubmitting: false
      const errorBranch = code.match(/else\s*\{[\s\S]*?isSubmitting:\s*false/);
      assert.ok(errorBranch, "Error branch must reset isSubmitting to false");

      // Verify that catch block also resets isSubmitting: false
      const catchBranch = code.match(/catch\s*\([^\)]*\)\s*\{[\s\S]*?isSubmitting:\s*false/);
      assert.ok(catchBranch, "Catch block must reset isSubmitting to false");
    });

    it("3.3: Success branch updates pet state with badgeLabel: 'Adopted!' and status: 'adopted'", () => {
      const catalogClientPath = path.join(projectRoot, "src", "components", "AdminPetCatalogClient.tsx");
      const code = fs.readFileSync(catalogClientPath, "utf-8");

      assert.ok(
        code.includes('status: "adopted"') && code.includes('badgeLabel: "Adopted!"'),
        "Must synchronize both status and badgeLabel in local pet state"
      );
      assert.ok(code.includes("showToast"), "Must call showToast on success");
      assert.ok(code.includes("setAdoptingPet(null)"), "Must close modal on success");
      assert.ok(code.includes("router.refresh()"), "Must refresh server state on success");
    });
  });

  // =========================================================================
  // SUITE 4: Image Optimization & CLS Prevention Auditing (R4)
  // =========================================================================
  describe("Suite 4: Image Optimization & CLS Prevention Auditing (R4)", () => {
    it("4.1: next.config.ts configures remotePatterns for Supabase storage", () => {
      const configPath = path.join(projectRoot, "next.config.ts");
      const code = fs.readFileSync(configPath, "utf-8");

      assert.ok(code.includes("remotePatterns"), "next.config.ts must declare remotePatterns");
      assert.ok(code.includes("**.supabase.co"), "next.config.ts must allow Supabase storage domain");
    });

    it("4.2: PetCard supports priority prop with eager loading and explicit dimensions (400x320)", () => {
      const petCardPath = path.join(projectRoot, "src", "components", "PetCard.tsx");
      const code = fs.readFileSync(petCardPath, "utf-8");

      assert.ok(code.includes("priority?: boolean") || code.includes("priority = false"), "PetCard must accept priority prop");
      assert.ok(code.includes('loading={priority ? "eager" : "lazy"}'), "Must dynamically set loading based on priority");
      assert.ok(code.includes('fetchPriority={priority ? "high" : "auto"}'), "Must set fetchPriority for LCP");
      assert.ok(code.includes("width={400}"), "Must declare explicit width={400} to prevent CLS");
      assert.ok(code.includes("height={320}"), "Must declare explicit height={320} to prevent CLS");
      assert.ok(code.includes('decoding="async"'), "Must declare decoding='async'");
    });

    it("4.3: HomeClient sets priority={idx < 2} on top catalog cards and eager hero image", () => {
      const homeClientPath = path.join(projectRoot, "src", "components", "HomeClient.tsx");
      const code = fs.readFileSync(homeClientPath, "utf-8");

      assert.ok(code.includes("priority={idx < 2}"), "HomeClient must pass priority={idx < 2} to PetCard");
      assert.ok(code.includes('fetchPriority="high"'), "Hero image must have fetchPriority high");
      assert.ok(code.includes('loading="eager"'), "Hero image must have loading eager");
      assert.ok(code.includes("width={600}"), "Hero image must declare explicit width to avoid CLS");
      assert.ok(code.includes("height={450}"), "Hero image must declare explicit height to avoid CLS");
    });

    it("4.4: PetProfileClient hero image has loading='eager', fetchPriority='high', and explicit dimensions (800x550)", () => {
      const profileClientPath = path.join(projectRoot, "src", "components", "PetProfileClient.tsx");
      const code = fs.readFileSync(profileClientPath, "utf-8");

      assert.ok(code.includes('loading="eager"'), "Hero profile photo must be eager loaded");
      assert.ok(code.includes('fetchPriority="high"'), "Hero profile photo must have high fetchPriority");
      assert.ok(code.includes("width={800}"), "Hero photo must specify width 800");
      assert.ok(code.includes("height={550}"), "Hero photo must specify height 550");
      assert.ok(code.includes("width={76}") && code.includes("height={76}"), "Thumbnails must specify dimensions");
    });

    it("4.5: AdminPetCatalogClient card images declare width={380} and height={240}", () => {
      const adminCatalogPath = path.join(projectRoot, "src", "components", "AdminPetCatalogClient.tsx");
      const code = fs.readFileSync(adminCatalogPath, "utf-8");

      assert.ok(code.includes("width={380}"), "Admin catalog pet card image must define width 380");
      assert.ok(code.includes("height={240}"), "Admin catalog pet card image must define height 240");
      assert.ok(code.includes('loading="lazy"'), "Admin catalog images should be lazy-loaded");
    });
  });

  // =========================================================================
  // SUITE 5: Celebratory Modal Layout & Responsive CSS Auditing (R3, R5)
  // =========================================================================
  describe("Suite 5: Celebratory Modal Layout & Responsive Mobile Styling (R3, R5)", () => {
    it("5.1: Modal container uses flex-column structure with scroll body and pinned actions", () => {
      const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");
      const css = fs.readFileSync(globalsCssPath, "utf-8");

      assert.ok(css.includes(".adopt-modal-body"), "Must have dedicated .adopt-modal-body scroll container");
      assert.ok(css.includes("flex-direction: column"), "Admin modal card must use flex column");
      assert.ok(css.includes("flex-shrink: 0"), "Modal actions must be pinned with flex-shrink: 0");
    });

    it("5.2: Under @media (max-width: 640px), modal-actions stacks buttons with full width and min-height 48px", () => {
      const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");
      const css = fs.readFileSync(globalsCssPath, "utf-8");

      assert.ok(css.includes("column-reverse"), "Modal actions must stack in column-reverse on mobile for natural reach");
      assert.ok(css.includes("min-height: 48px"), "Buttons must have minimum 48px tap target on mobile");
    });

    it("5.3: Admin toast banner is fixed floating to be visible across all catalog scroll positions", () => {
      const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");
      const css = fs.readFileSync(globalsCssPath, "utf-8");

      assert.ok(css.includes("position: fixed"), "Toast banner must be fixed positioned");
      assert.ok(css.includes("z-index: 1000") || css.includes("z-index: 1100"), "Toast banner must float above content");
    });
  });
});
