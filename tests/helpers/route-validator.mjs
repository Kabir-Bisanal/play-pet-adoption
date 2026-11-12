import fs from "node:fs";
import path from "node:path";
import { SAMPLE_PETS } from "../../src/data/pets.ts";

export function getDynamicRoutePath(projectDir = process.cwd()) {
  return path.join(projectDir, "src", "app", "adopt", "[id]", "page.tsx");
}

export function validateDynamicRouteStructure(projectDir = process.cwd()) {
  const routePath = getDynamicRoutePath(projectDir);
  const exists = fs.existsSync(routePath);

  if (!exists) {
    return {
      exists: false,
      routePath,
      hasGenerateStaticParams: false,
      hasNotFound: false,
      hasAsyncParams: false,
      issues: ["src/app/adopt/[id]/page.tsx does not exist"],
    };
  }

  const content = fs.readFileSync(routePath, "utf-8");
  const issues = [];

  const hasGenerateStaticParams = content.includes("generateStaticParams");
  if (!hasGenerateStaticParams) {
    issues.push("Missing export async function generateStaticParams()");
  }

  const hasNotFound = content.includes("notFound()") && content.includes("next/navigation");
  if (!hasNotFound) {
    issues.push("Missing notFound() handler from next/navigation for invalid pet IDs");
  }

  const hasAsyncParams =
    content.includes("await params") ||
    /params\s*:\s*Promise/i.test(content) ||
    content.includes("params.id");
  if (!hasAsyncParams) {
    issues.push("Missing async params resolution for Next.js 15 dynamic route");
  }

  return {
    exists: true,
    routePath,
    hasGenerateStaticParams,
    hasNotFound,
    hasAsyncParams,
    issues,
  };
}

export function validateStaticParamsContract(pets = SAMPLE_PETS) {
  if (!Array.isArray(pets) || pets.length === 0) {
    return { valid: false, error: "Pets list is empty or not an array" };
  }

  const params = pets.map((pet) => ({ id: pet.id }));
  const uniqueIds = new Set(params.map((p) => p.id));

  const valid =
    params.length === pets.length &&
    uniqueIds.size === pets.length &&
    params.every((p) => typeof p.id === "string" && p.id.length > 0);

  return {
    valid,
    totalParams: params.length,
    params,
    uniqueCount: uniqueIds.size,
  };
}

export function validateCompanionSlugs(pets = SAMPLE_PETS) {
  const issues = [];
  const seen = new Set();
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  for (const pet of pets) {
    if (!pet.id || typeof pet.id !== "string") {
      issues.push(`Pet missing valid string ID: ${JSON.stringify(pet.name)}`);
      continue;
    }

    if (!slugRegex.test(pet.id)) {
      issues.push(
        `Pet ID '${pet.id}' is not a URL-safe lowercase slug (must match ${slugRegex})`
      );
    }

    if (seen.has(pet.id)) {
      issues.push(`Duplicate pet ID found: '${pet.id}'`);
    }
    seen.add(pet.id);
  }

  return {
    allValid: issues.length === 0,
    totalCount: pets.length,
    issues,
  };
}

export function validateNotFoundRoute(projectDir = process.cwd()) {
  const notFoundPath = path.join(projectDir, "src", "app", "not-found.tsx");
  const exists = fs.existsSync(notFoundPath);

  if (!exists) {
    return { exists: false, issues: ["src/app/not-found.tsx does not exist"] };
  }

  const content = fs.readFileSync(notFoundPath, "utf-8");
  const issues = [];

  const hasDefaultExport = content.includes("export default function");
  if (!hasDefaultExport) {
    issues.push("Missing export default function NotFound");
  }

  const hasAdoptLink = content.includes('href="/adopt"') || content.includes("Browse Available Pets");
  if (!hasAdoptLink) {
    issues.push("Missing navigation link back to /adopt");
  }

  const hasMetadata = content.includes("metadata");
  if (!hasMetadata) {
    issues.push("Missing metadata export for 404 page");
  }

  return {
    exists: true,
    notFoundPath,
    hasDefaultExport,
    hasAdoptLink,
    hasMetadata,
    issues,
    valid: issues.length === 0,
  };
}
