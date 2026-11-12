import fs from "node:fs";
import path from "node:path";

export function getProjectRoot(startDir = process.cwd()) {
  let curr = startDir;
  while (curr && curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, "package.json"))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return startDir;
}

export function hasBuildArtifacts(projectDir = getProjectRoot()) {
  const buildAppDir = path.join(projectDir, ".next", "server", "app");
  return fs.existsSync(buildAppDir);
}

export function inspectAdoptHtml(projectDir = getProjectRoot()) {
  const htmlPath = path.join(projectDir, ".next", "server", "app", "adopt.html");
  if (!fs.existsSync(htmlPath)) {
    return { exists: false, error: "adopt.html not found in build output" };
  }
  const content = fs.readFileSync(htmlPath, "utf-8");

  return {
    exists: true,
    path: htmlPath,
    contentLength: content.length,
    hasSearchInput: content.includes("search-input") || content.includes('type="text"'),
    hasFilterTabs: content.includes("filter-btn") || content.includes("filter-bar"),
    hasPetGrid: content.includes("pet-grid") || content.includes("pet-card"),
    hasImages: /\/images\/[1-7]\.jpeg/.test(content),
  };
}

export function inspectNotFoundHtml(projectDir = getProjectRoot()) {
  const htmlPath = path.join(projectDir, ".next", "server", "app", "_not-found.html");
  if (!fs.existsSync(htmlPath)) {
    return { exists: false, error: "_not-found.html not found in build output" };
  }
  const content = fs.readFileSync(htmlPath, "utf-8");

  return {
    exists: true,
    path: htmlPath,
    contentLength: content.length,
    has404Message: /404|Page Not Found|Went Cold/i.test(content),
    hasAdoptLink: content.includes('href="/adopt"') || content.includes("Browse Available Pets"),
    hasWhatsAppLink: content.includes("918630438778") || content.includes("wa.me"),
  };
}

export function inspectNotFoundSource(projectDir = getProjectRoot()) {
  const sourcePath = path.join(projectDir, "src", "app", "not-found.tsx");
  if (!fs.existsSync(sourcePath)) {
    return { exists: false, error: "src/app/not-found.tsx not found" };
  }
  const content = fs.readFileSync(sourcePath, "utf-8");

  return {
    exists: true,
    path: sourcePath,
    hasDefaultExport: content.includes("export default function NotFound"),
    hasMetadata: content.includes("export const metadata"),
    hasAdoptLink: content.includes('href="/adopt"'),
    hasProcessLink: content.includes('href="/process"'),
    hasWhatsAppLink: content.includes("buildWhatsAppUrl"),
    hasColdTrailTitle: content.includes("Looks Like This Trail Went Cold"),
  };
}

export function inspectProfileSource(projectDir = getProjectRoot()) {
  const routePagePath = path.join(projectDir, "src", "app", "adopt", "[id]", "page.tsx");
  const clientComponentPath = path.join(projectDir, "src", "components", "PetProfileClient.tsx");

  const pageExists = fs.existsSync(routePagePath);
  const clientExists = fs.existsSync(clientComponentPath);

  let pageContent = "";
  let clientContent = "";

  if (pageExists) {
    pageContent = fs.readFileSync(routePagePath, "utf-8");
  }
  if (clientExists) {
    clientContent = fs.readFileSync(clientComponentPath, "utf-8");
  }

  const combined = `${pageContent}\n${clientContent}`;

  return {
    pageExists,
    clientExists,
    routePagePath,
    clientComponentPath,
    hasGenerateStaticParams: pageContent.includes("generateStaticParams"),
    hasAsyncParams: /params\s*:\s*Promise/i.test(pageContent) || /await\s+params/i.test(pageContent) || pageContent.includes("params"),
    hasNotFoundCall: pageContent.includes("notFound()"),
    hasGallery: combined.includes("gallery") || combined.includes("thumbnail"),
    hasPetIdBadge: combined.includes("adoptionCode") || combined.includes("badge"),
    hasMedicalSection: /medicalHistory|vaccination|deworm/i.test(combined),
    hasRequirementsSection: /adoptionRequirements|requirements/i.test(combined),
    hasWhatsAppCta: combined.includes("buildWhatsAppUrl") || combined.includes("wa.me"),
  };
}

export function inspectPetCardSource(projectDir = getProjectRoot()) {
  const sourcePath = path.join(projectDir, "src", "components", "PetCard.tsx");
  if (!fs.existsSync(sourcePath)) {
    return { exists: false, error: "src/components/PetCard.tsx not found" };
  }
  const content = fs.readFileSync(sourcePath, "utf-8");

  return {
    exists: true,
    path: sourcePath,
    hasWhatsAppBtn: content.includes("buildWhatsAppUrl"),
    hasProfileLinkOrHandler: content.includes("onViewProfile") || content.includes("/adopt/"),
    hasSpeciesBadge: content.includes("badge-species") || content.includes("badgeLabel"),
    hasTags: content.includes("pet.tags") || content.includes("pet-tags"),
  };
}

export function inspectPetModalSource(projectDir = getProjectRoot()) {
  const sourcePath = path.join(projectDir, "src", "components", "PetModal.tsx");
  if (!fs.existsSync(sourcePath)) {
    return { exists: false, error: "src/components/PetModal.tsx not found" };
  }
  const content = fs.readFileSync(sourcePath, "utf-8");

  return {
    exists: true,
    path: sourcePath,
    hasAdoptionCodeDisplay: content.includes("pet.adoptionCode"),
    hasVaccination: content.includes("vaccinationStatus"),
    hasDewormed: content.includes("dewormedStatus"),
    hasSterilisation: content.includes("sterilisationStatus"),
    hasWhatsAppInquiry: content.includes("buildWhatsAppUrl"),
  };
}

export function verifyWhatsAppCta(url, expectedName = null, expectedCode = null) {
  if (!url || typeof url !== "string") {
    return { isValid: false, reason: "URL must be a non-empty string" };
  }

  const prefix = "https://wa.me/918630438778?text=";
  if (!url.startsWith(prefix)) {
    return { isValid: false, reason: `URL does not start with expected prefix '${prefix}'` };
  }

  const encodedText = url.slice(prefix.length);
  const decodedText = decodeURIComponent(encodedText);

  if (expectedName && !decodedText.toLowerCase().includes(expectedName.toLowerCase())) {
    return {
      isValid: false,
      reason: `Decoded text does not contain expected pet name '${expectedName}'. Got: '${decodedText}'`,
    };
  }

  if (expectedCode) {
    const cleanCode = expectedCode.replace(/^#/, "");
    if (!decodedText.includes(cleanCode)) {
      return {
        isValid: false,
        reason: `Decoded text does not contain expected adoption code '${expectedCode}'. Got: '${decodedText}'`,
      };
    }
  }

  return { isValid: true, decodedText };
}
