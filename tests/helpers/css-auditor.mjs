import fs from "node:fs";
import path from "node:path";

export const REQUIRED_TOKENS = {
  "--bg-canvas": "#FAF7F2",
  "--text-main": "#2B2523",
  "--brand-forest": "#2D5A46",
  "--accent-coral": "#E07A5F",
  "--accent-amber": "#F4A261",
};

export const CATALOG_SELECTORS = [
  ".adopt-catalog-container",
  ".catalog-search-wrap",
  ".search-input-box",
  ".search-input",
  ".search-clear-btn",
  ".filter-bar-wrap",
  ".filter-bar",
  ".filter-btn",
  ".filter-count",
  ".catalog-empty-state",
  ".empty-state-icon",
  ".empty-state-title",
  ".empty-state-desc",
  ".empty-state-actions",
  ".btn-empty-reset",
  ".btn-empty-wa",
  ".not-found-section",
  ".not-found-card",
];

export function auditCoreTokens(cssPath = null) {
  const filePath = cssPath || path.resolve(process.cwd(), "src/app/globals.css");
  if (!fs.existsSync(filePath)) {
    throw new Error(`globals.css not found at: ${filePath}`);
  }
  const css = fs.readFileSync(filePath, "utf-8");

  const results = {};
  let allValid = true;

  for (const [varName, expectedHex] of Object.entries(REQUIRED_TOKENS)) {
    // Regex matching: --var-name: #HEX;
    const regex = new RegExp(`${varName}\\s*:\\s*(${expectedHex})\\s*;`, "i");
    const match = regex.exec(css);
    const found = Boolean(match);
    results[varName] = {
      expected: expectedHex,
      found: match ? match[1].toUpperCase() : null,
      passed: found,
    };
    if (!found) {
      allValid = false;
    }
  }

  return { allValid, details: results };
}

export function auditRequiredSelectors(cssPath = null, selectors = CATALOG_SELECTORS) {
  const filePath = cssPath || path.resolve(process.cwd(), "src/app/globals.css");
  const css = fs.readFileSync(filePath, "utf-8");

  const results = {};
  let allPresent = true;

  for (const selector of selectors) {
    const present = css.includes(selector);
    results[selector] = present;
    if (!present) {
      allPresent = false;
    }
  }

  return { allPresent, details: results };
}

export function auditMediaQueries(cssPath = null) {
  const filePath = cssPath || path.resolve(process.cwd(), "src/app/globals.css");
  const css = fs.readFileSync(filePath, "utf-8");

  const hasTabletQuery = /@media\s*\(\s*max-width\s*:\s*960px\s*\)/.test(css);
  const hasMobileQuery = /@media\s*\(\s*max-width\s*:\s*640px\s*\)/.test(css);

  // Check responsive overrides inside media queries
  const tabletBlock = css.split(/@media\s*\(\s*max-width\s*:\s*960px\s*\)/)[1] || "";
  const mobileBlock = css.split(/@media\s*\(\s*max-width\s*:\s*640px\s*\)/)[1] || "";

  const tabletChecks = {
    hasHeroOrGridResponsive: tabletBlock.includes(".pet-grid") || tabletBlock.includes("grid-template-columns"),
    hasFilterOrSearchResponsive: tabletBlock.includes(".filter-btn") || tabletBlock.includes(".catalog-search-wrap"),
  };

  const mobileChecks = {
    hasSearchInputMobile: mobileBlock.includes(".search-input"),
    hasFilterBarMobile: mobileBlock.includes(".filter-bar"),
    hasEmptyStateMobile: mobileBlock.includes(".catalog-empty-state"),
  };

  return {
    hasTabletQuery,
    hasMobileQuery,
    tabletChecks,
    mobileChecks,
    allValid: hasTabletQuery && hasMobileQuery,
  };
}
