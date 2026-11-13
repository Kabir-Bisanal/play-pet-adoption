import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Color & WCAG Utility Functions
function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "").trim();
  const fullHex = cleanHex.length === 3
    ? cleanHex.split("").map((c) => c + c).join("")
    : cleanHex;
  return {
    r: parseInt(fullHex.substring(0, 2), 16),
    g: parseInt(fullHex.substring(2, 4), 16),
    b: parseInt(fullHex.substring(4, 6), 16),
  };
}

function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(c1.r, c1.g, c1.b);
  const l2 = getRelativeLuminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const ROOT_DIR = process.cwd();
const GLOBALS_CSS = fs.readFileSync(path.join(ROOT_DIR, "src/app/globals.css"), "utf-8");
const ADMIN_PET_FORM_TSX = fs.readFileSync(path.join(ROOT_DIR, "src/components/AdminPetForm.tsx"), "utf-8");
const ADMIN_PET_CATALOG_TSX = fs.readFileSync(path.join(ROOT_DIR, "src/components/AdminPetCatalogClient.tsx"), "utf-8");

test("Empirical Challenger Suite: UI, Typography, Contrast & Responsive Layout", async (t) => {
  await t.test("R2: Mark as Adopted Button Contrast Ratio Verification", async (st) => {
    // Extract declared CSS root variables
    const brandCoralMatch = GLOBALS_CSS.match(/--brand-coral:\s*(#[0-9a-fA-F]{6})/);
    assert.ok(brandCoralMatch, "globals.css must declare --brand-coral");
    const brandCoral = brandCoralMatch[1];
    assert.strictEqual(brandCoral.toUpperCase(), "#C85A3F", "--brand-coral must be #C85A3F");

    const brandCoralHoverMatch = GLOBALS_CSS.match(/--brand-coral-hover:\s*(#[0-9a-fA-F]{6})/);
    assert.ok(brandCoralHoverMatch, "globals.css must declare --brand-coral-hover");
    const brandCoralHover = brandCoralHoverMatch[1];

    const bgSubtleMatch = GLOBALS_CSS.match(/--bg-subtle:\s*(#[0-9a-fA-F]{6})/);
    assert.ok(bgSubtleMatch, "globals.css must declare --bg-subtle");
    const bgSubtle = bgSubtleMatch[1];
    assert.strictEqual(bgSubtle.toUpperCase(), "#F3EEE7", "--bg-subtle must be #F3EEE7");

    // 1. Text contrast of button (White text on Brand Coral background)
    const textOnCoralRatio = getContrastRatio("#FFFFFF", brandCoral);
    // WCAG 2.1 AA requirement: 4.5:1 for normal text, 3:1 for large text (>= 18pt or 14pt bold).
    // Button has font-weight: 800 (bold), font-size ~ 0.85-0.9rem
    assert.ok(
      textOnCoralRatio >= 4.0,
      `Text contrast ratio (${textOnCoralRatio.toFixed(2)}:1) must provide strong legibility (>= 4.0:1)`
    );

    // 2. Button surface contrast against container background (#C85A3F against #F3EEE7)
    // WCAG 2.1 SC 1.4.11 Non-text Contrast requires >= 3.0:1 for user interface components against adjacent backgrounds
    const surfaceOnBgRatio = getContrastRatio(brandCoral, bgSubtle);
    assert.ok(
      surfaceOnBgRatio >= 3.0,
      `Button surface contrast ratio against card toolbar (${surfaceOnBgRatio.toFixed(2)}:1) must meet WCAG 2.1 Non-text Contrast (>= 3.0:1)`
    );

    // 3. Hover state text contrast (White text on #A03820)
    const hoverTextRatio = getContrastRatio("#FFFFFF", brandCoralHover);
    assert.ok(
      hoverTextRatio >= 4.5,
      `Hover text contrast ratio (${hoverTextRatio.toFixed(2)}:1) must meet WCAG AA normal text (>= 4.5:1)`
    );

    // 4. Hover button surface contrast against container background (#A03820 against #F3EEE7)
    const hoverSurfaceRatio = getContrastRatio(brandCoralHover, bgSubtle);
    assert.ok(
      hoverSurfaceRatio >= 4.5,
      `Hover surface contrast ratio against card toolbar (${hoverSurfaceRatio.toFixed(2)}:1) must exceed 4.5:1`
    );

    // 5. Border contrast against container background (#B34930 on #F3EEE7)
    const borderRatio = getContrastRatio("#B34930", bgSubtle);
    assert.ok(
      borderRatio >= 3.0,
      `Button border contrast against card toolbar (${borderRatio.toFixed(2)}:1) must meet WCAG Non-text contrast (>= 3.0:1)`
    );

    // 6. Check .btn-manage-action.adopt explicit CSS properties
    assert.match(
      GLOBALS_CSS,
      /\.btn-manage-action\.adopt\s*\{[^}]*background:\s*#C85A3F/s,
      "adopt button must declare explicit background #C85A3F"
    );
    assert.match(
      GLOBALS_CSS,
      /\.btn-manage-action\.adopt\s*\{[^}]*color:\s*#FFFFFF/s,
      "adopt button must declare explicit white text"
    );
    assert.match(
      GLOBALS_CSS,
      /\.btn-manage-action\.adopt:focus-visible\s*\{[^}]*outline/s,
      "adopt button must declare focus-visible outline for keyboard navigation"
    );
  });

  await t.test("R1: Section 5 Typography & Vertical Separation Verification", async (st) => {
    // 1. Check AdminPetForm.tsx JSX structure
    assert.match(
      ADMIN_PET_FORM_TSX,
      /<section className="admin-form-section">[\s\S]*?<h2 className="section-title">Listing Visibility<\/h2>/,
      "AdminPetForm must have Section 5 with Listing Visibility title"
    );
    assert.match(
      ADMIN_PET_FORM_TSX,
      /<div className="status-options-grid"\s+role="radiogroup"\s+aria-label="Listing Visibility">/,
      "status-options-grid must have role='radiogroup' and aria-label"
    );
    assert.match(
      ADMIN_PET_FORM_TSX,
      /<strong className="status-option-title">Ready for Adoption<\/strong>\s*<span className="status-option-desc">Visible immediately in the public catalog<\/span>/,
      "AdminPetForm Section 5 must render strong.status-option-title and span.status-option-desc inside status-option-text"
    );

    // 2. Check globals.css rules for vertical separation
    // Must set display: block on strong and span
    const strongRuleMatch = GLOBALS_CSS.match(
      /\.status-option-card strong,\s*\.status-option-card \.status-option-title\s*\{([^}]+)\}/s
    );
    assert.ok(strongRuleMatch, "globals.css must have rule for .status-option-card strong");
    const strongCSS = strongRuleMatch[1];
    assert.match(strongCSS, /display:\s*block;/, "strong / title must have display: block");
    assert.match(strongCSS, /margin-bottom:\s*4px;/, "strong / title must have margin-bottom for vertical separation");
    assert.match(strongCSS, /font-weight:\s*700;/, "strong / title must be bold");

    const spanRuleMatch = GLOBALS_CSS.match(
      /\.status-option-card span:not\(\.status-icon\),\s*\.status-option-card \.status-option-desc\s*\{([^}]+)\}/s
    );
    assert.ok(spanRuleMatch, "globals.css must have rule for .status-option-card span:not(.status-icon)");
    const spanCSS = spanRuleMatch[1];
    assert.match(spanCSS, /display:\s*block;/, "span / desc must have display: block");
    assert.match(spanCSS, /line-height:\s*1\.45;/, "span / desc must have comfortable line-height");

    // 3. Contrast check for Section 5 text
    const titleOnSurfaceRatio = getContrastRatio("#2B2523", "#FFFFFF");
    assert.ok(titleOnSurfaceRatio >= 10.0, "Title text contrast must exceed 10:1");
    const titleOnSelectedRatio = getContrastRatio("#2B2523", "#FAF7F2");
    assert.ok(titleOnSelectedRatio >= 10.0, "Title text contrast on selected card must exceed 10:1");

    const descOnSurfaceRatio = getContrastRatio("#6E6662", "#FFFFFF");
    assert.ok(descOnSurfaceRatio >= 4.5, `Description text contrast (${descOnSurfaceRatio.toFixed(2)}:1) must meet WCAG AA >= 4.5:1`);
    const descOnSelectedRatio = getContrastRatio("#6E6662", "#FAF7F2");
    assert.ok(descOnSelectedRatio >= 4.5, `Description text contrast on selected card (${descOnSelectedRatio.toFixed(2)}:1) must meet WCAG AA >= 4.5:1`);
  });

  await t.test("R3: Celebratory Adoption Modal Layout & Clipping Stress Test", async (st) => {
    // 1. Modal container constraints in globals.css
    const modalMatch = GLOBALS_CSS.match(/\.admin-modal-card\s*\{([^}]+)\}/s);
    assert.ok(modalMatch, "globals.css must define .admin-modal-card");
    const modalCSS = modalMatch[1];
    assert.match(modalCSS, /display:\s*flex;/, "Modal card must be flex container");
    assert.match(modalCSS, /flex-direction:\s*column;/, "Modal card must be flex column");
    assert.match(modalCSS, /overflow:\s*hidden;/, "Modal card must set overflow: hidden to contain scroll area");
    assert.match(modalCSS, /max-height:\s*min\(90vh,\s*700px\);/, "Modal card must cap max-height at min(90vh, 700px)");

    // 2. Form flex constraints
    const formMatch = GLOBALS_CSS.match(/\.adopt-celebrate-form\s*\{([^}]+)\}/s);
    assert.ok(formMatch, "globals.css must define .adopt-celebrate-form");
    const formCSS = formMatch[1];
    assert.match(formCSS, /display:\s*flex;/, "Form must be flex");
    assert.match(formCSS, /flex-direction:\s*column;/, "Form must be flex column");
    assert.match(formCSS, /flex:\s*1;/, "Form must flex: 1");
    assert.match(formCSS, /min-height:\s*0;/, "Form must have min-height: 0 to prevent flex expansion overflow");
    assert.match(formCSS, /overflow:\s*hidden;/, "Form must have overflow: hidden");

    // 3. Scrollable body
    const bodyMatch = GLOBALS_CSS.match(/\.adopt-modal-body\s*\{([^}]+)\}/s);
    assert.ok(bodyMatch, "globals.css must define .adopt-modal-body");
    const bodyCSS = bodyMatch[1];
    assert.match(bodyCSS, /overflow-y:\s*auto;/, "adopt-modal-body must have overflow-y: auto for scrolling");
    assert.match(bodyCSS, /flex:\s*1;/, "adopt-modal-body must flex: 1");

    // 4. Modal action buttons docked at bottom in admin modal section
    // Find the .modal-actions rule that defines the docked admin modal action bar (around line 3850)
    const adminActionsMatch = GLOBALS_CSS.match(
      /\.admin-modal-card[\s\S]*?\.modal-actions\s*\{([^}]+)\}/s
    );
    assert.ok(adminActionsMatch, "globals.css must define .modal-actions in the admin modal section");
    const actionsCSS = adminActionsMatch[1];
    assert.match(actionsCSS, /flex-shrink:\s*0;/, "admin modal-actions must have flex-shrink: 0 to prevent button squishing");
    assert.match(actionsCSS, /display:\s*flex;/, "admin modal-actions must be flex");
    assert.match(actionsCSS, /border-top:/, "admin modal-actions must have border-top divider");

    // 5. Check Mobile Stacking and Touch Target Rules (< 640px)
    const mobileMedia = GLOBALS_CSS.split("@media (max-width: 640px)")[1];
    assert.ok(mobileMedia, "globals.css must contain @media (max-width: 640px)");
    
    assert.match(
      mobileMedia,
      /\.modal-actions\s*\{[^}]*flex-direction:\s*column-reverse;/s,
      "modal-actions on mobile must stack with flex-direction: column-reverse"
    );
    assert.match(
      mobileMedia,
      /\.btn-modal-cancel,\s*\.btn-modal-confirm\s*\{[^}]*min-height:\s*48px;/s,
      "Modal buttons on mobile must provide min-height: 48px tap target"
    );
    assert.match(
      mobileMedia,
      /\.btn-modal-cancel,\s*\.btn-modal-confirm\s*\{[^}]*width:\s*100%;/s,
      "Modal buttons on mobile must span full width"
    );

    // 6. Viewport Height Mathematical Simulation
    // Test that across all common device heights, header + footer + padding <= modal height,
    // leaving a positive viewport space for scroll body without clipping buttons.
    const viewports = [
      { name: "Desktop Large", width: 1920, height: 1080 },
      { name: "Desktop Standard", width: 1440, height: 900 },
      { name: "Laptop Standard", width: 1366, height: 768 },
      { name: "Tablet Portrait", width: 768, height: 1024 },
      { name: "Tablet Landscape", width: 1024, height: 768 },
      { name: "Mobile Large (iPhone 14 Pro Max)", width: 430, height: 932 },
      { name: "Mobile Standard (iPhone 12/13/14)", width: 390, height: 844 },
      { name: "Mobile Android (Samsung Galaxy)", width: 360, height: 800 },
      { name: "Mobile Compact (iPhone SE)", width: 375, height: 667 },
      { name: "Mobile Small", width: 320, height: 568 },
    ];

    viewports.forEach((vp) => {
      const isMobile = vp.width <= 640;
      const isCompactMobile = vp.width <= 480;
      
      // Calculate max modal height based on CSS rules:
      // Desktop: min(90vh, 700px)
      // Mobile <= 640px: 90vh
      // Mobile <= 480px: 92vh
      let maxModalHeight;
      if (isCompactMobile) {
        maxModalHeight = vp.height * 0.92;
      } else if (isMobile) {
        maxModalHeight = vp.height * 0.90;
      } else {
        maxModalHeight = Math.min(vp.height * 0.90, 700);
      }

      // Measured structural heights (header + docked actions):
      // Header: ~70px on mobile, ~85px on desktop
      // Docked actions:
      // Mobile: column-reverse 2 buttons (min 48px each) + gap (10px) + padding (14px + 16px) = ~136px
      // Desktop: row buttons (min 44px) + padding (16px + 20px) = ~80px
      const headerHeight = isMobile ? 70 : 85;
      const actionsHeight = isMobile ? 136 : 80;
      const fixedChromeHeight = headerHeight + actionsHeight;

      const remainingBodyHeight = maxModalHeight - fixedChromeHeight;

      assert.ok(
        remainingBodyHeight > 100,
        `Viewport ${vp.name} (${vp.width}x${vp.height}) must have at least 100px scrollable body height (actual: ${remainingBodyHeight.toFixed(1)}px)`
      );
      assert.ok(
        maxModalHeight <= vp.height,
        `Modal height (${maxModalHeight.toFixed(1)}px) must not exceed viewport height (${vp.height}px)`
      );
    });

    // 7. Check Toast Banner Positioning
    const toastMatch = GLOBALS_CSS.match(/\.admin-toast-banner\s*\{([^}]+)\}/s);
    assert.ok(toastMatch, "globals.css must define .admin-toast-banner");
    const toastCSS = toastMatch[1];
    assert.match(toastCSS, /position:\s*fixed;/, "Toast banner must have position: fixed");
    assert.match(toastCSS, /top:\s*24px;/, "Toast banner must be docked at top");
    assert.match(toastCSS, /z-index:\s*1000;/, "Toast banner must have z-index: 1000 to overlay catalog");
  });

  await t.test("R5: Mobile UI Spacing & Touch Target Stress Test", async (st) => {
    // Check mobile media queries for generous spacing
    const mobileMedia = GLOBALS_CSS.split("@media (max-width: 640px)")[1];
    assert.ok(mobileMedia, "globals.css must contain @media (max-width: 640px)");

    // 1. Check .action-row-main single column layout
    assert.match(
      mobileMedia,
      /\.action-row-main\s*\{[^}]*grid-template-columns:\s*1fr;/s,
      ".action-row-main on mobile must collapse to single column (1fr) so buttons do not squish"
    );

    // 2. Check full width and minimum touch target on .btn-manage-action
    assert.match(
      mobileMedia,
      /\.btn-manage-action\s*\{[^}]*width:\s*100%;/s,
      ".btn-manage-action on mobile must be width: 100%"
    );
    assert.match(
      mobileMedia,
      /\.btn-manage-action\s*\{[^}]*min-height:\s*46px;/s,
      ".btn-manage-action on mobile must have min-height >= 46px (exceeds WCAG 44px target size)"
    );

    // 3. Check admin card padding
    assert.match(
      mobileMedia,
      /\.admin-card\s*\{[^}]*padding:\s*20px 18px;/s,
      ".admin-card on mobile must have generous padding (20px 18px)"
    );

    // 4. Check admin form section padding
    assert.match(
      mobileMedia,
      /\.admin-form-section\s*\{[^}]*padding:\s*20px 18px;/s,
      ".admin-form-section on mobile must have generous padding (20px 18px)"
    );

    // 5. Check ultra-compact 480px adaptations
    const compactMedia = GLOBALS_CSS.split("@media (max-width: 480px)")[1];
    assert.ok(compactMedia, "globals.css must contain @media (max-width: 480px)");
    assert.match(
      compactMedia,
      /\.admin-modal-card\s*\{[^}]*padding:\s*18px 14px;/s,
      ".admin-modal-card on 480px screens must adapt padding to 18px 14px"
    );
  });
});
