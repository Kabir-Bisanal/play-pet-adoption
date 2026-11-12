#!/usr/bin/env node

/**
 * Master E2E Test Runner for Play Pet Adoption (Step 4)
 * Native Node.js 24 Test Runner with Tier Selection & Formatted CLI Reports
 *
 * Usage:
 *   node --experimental-strip-types tests/e2e-runner.mjs           # Run all tiers
 *   node --experimental-strip-types tests/e2e-runner.mjs --tier=1  # Feature coverage
 *   node --experimental-strip-types tests/e2e-runner.mjs --tier=2  # Boundaries & corner cases
 *   node --experimental-strip-types tests/e2e-runner.mjs --tier=3  # Cross-feature combinations
 *   node --experimental-strip-types tests/e2e-runner.mjs --tier=4  # User journeys
 *   node --experimental-strip-types tests/e2e-runner.mjs --all     # Explicit all tiers
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

// ANSI Color Constants
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";
const BG_GREEN = "\x1b[42m\x1b[30m";
const BG_RED = "\x1b[41m\x1b[37m";

const PROJECT_ROOT = process.cwd();

const TIERS = [
  {
    id: 1,
    flag: "--tier=1",
    name: "Tier 1: Feature Coverage (Features 1-16)",
    file: "tests/tier1-feature-coverage.test.mjs",
  },
  {
    id: 2,
    flag: "--tier=2",
    name: "Tier 2: Boundary & Corner Cases",
    file: "tests/tier2-boundary-corner.test.mjs",
  },
  {
    id: 3,
    flag: "--tier=3",
    name: "Tier 3: Cross-Feature & Combinations",
    file: "tests/tier3-cross-feature.test.mjs",
  },
  {
    id: 4,
    flag: "--tier=4",
    name: "Tier 4: Real-World User Journeys",
    file: "tests/tier4-user-journeys.test.mjs",
  },
];

function parseArguments() {
  const args = process.argv.slice(2);
  const selectedTiers = [];

  const tier1 = args.includes("--tier=1");
  const tier2 = args.includes("--tier=2");
  const tier3 = args.includes("--tier=3");
  const tier4 = args.includes("--tier=4");
  const all = args.includes("--all") || (!tier1 && !tier2 && !tier3 && !tier4);

  if (all) {
    return TIERS;
  }

  if (tier1) selectedTiers.push(TIERS[0]);
  if (tier2) selectedTiers.push(TIERS[1]);
  if (tier3) selectedTiers.push(TIERS[2]);
  if (tier4) selectedTiers.push(TIERS[3]);

  return selectedTiers;
}

function parseTestOutput(output) {
  let passCount = 0;
  let failCount = 0;
  let skipCount = 0;
  let durationMs = 0;

  const lines = output.split("\n");
  for (const line of lines) {
    const passMatch = line.match(/ℹ pass (\d+)/);
    if (passMatch) passCount = parseInt(passMatch[1], 10);

    const failMatch = line.match(/ℹ fail (\d+)/);
    if (failMatch) failCount = parseInt(failMatch[1], 10);

    const skipMatch = line.match(/ℹ skipped (\d+)/);
    if (skipMatch) skipCount = parseInt(skipMatch[1], 10);

    const durMatch = line.match(/ℹ duration_ms ([\d.]+)/);
    if (durMatch) durationMs = parseFloat(durMatch[1]);
  }

  return {
    passCount,
    failCount,
    skipCount,
    totalCount: passCount + failCount + skipCount,
    durationMs,
  };
}

function runTier(tier) {
  const fullPath = path.resolve(PROJECT_ROOT, tier.file);
  if (!fs.existsSync(fullPath)) {
    return {
      tier,
      success: false,
      exitCode: 1,
      stats: { passCount: 0, failCount: 1, skipCount: 0, totalCount: 1, durationMs: 0 },
      rawOutput: `Test file not found: ${fullPath}`,
    };
  }

  const startTime = Date.now();
  const result = spawnSync(
    process.execPath,
    ["--no-warnings", "--experimental-strip-types", "--test", tier.file],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
      env: { ...process.env, FORCE_COLOR: "1" },
    }
  );
  const wallDuration = Date.now() - startTime;

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const combined = `${stdout}\n${stderr}`;

  const stats = parseTestOutput(combined);
  if (stats.durationMs === 0) {
    stats.durationMs = wallDuration;
  }

  const success = result.status === 0 && stats.failCount === 0;

  return {
    tier,
    success,
    exitCode: result.status,
    stats,
    rawOutput: combined,
  };
}

function main() {
  const startTime = Date.now();
  const tiersToRun = parseArguments();

  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  Haven Paws Adoption Platform — E2E Test Suite (Step 4)             ${RESET}`);
  console.log(`${GRAY}  Runtime: Node.js ${process.version} | Platform: ${process.platform} ${RESET}`);
  console.log(`${GRAY}  Timestamp: ${new Date().toISOString()} | Target Tiers: ${tiersToRun.map((t) => `T${t.id}`).join(", ")} ${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════════════${RESET}\n`);

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const tier of tiersToRun) {
    console.log(`${BOLD}▶ Running ${tier.name}...${RESET}`);
    const tierResult = runTier(tier);
    results.push(tierResult);

    const { stats, success } = tierResult;
    totalPassed += stats.passCount;
    totalFailed += stats.failCount;
    totalSkipped += stats.skipCount;

    if (success) {
      console.log(
        `  ${GREEN}✔ ${tier.name}${RESET} ${DIM}(${stats.passCount} passed, ${stats.durationMs.toFixed(1)}ms)${RESET}\n`
      );
    } else {
      console.log(
        `  ${RED}✖ ${tier.name} FAILED${RESET} ${DIM}(${stats.failCount} failed, ${stats.passCount} passed)${RESET}`
      );
      // Print failure details
      const failureLines = tierResult.rawOutput
        .split("\n")
        .filter((l) => l.includes("✖") || l.includes("AssertionError") || l.includes("Error:"));
      for (const line of failureLines.slice(0, 10)) {
        console.log(`    ${RED}${line}${RESET}`);
      }
      console.log("");
    }
  }

  const totalWallDuration = Date.now() - startTime;
  const allPassed = results.every((r) => r.success);

  // Summary Table
  console.log(`${BOLD}───────────────────────────────────────────────────────────────────────${RESET}`);
  console.log(`${BOLD}  TIER EXECUTION SUMMARY                                               ${RESET}`);
  console.log(`${BOLD}───────────────────────────────────────────────────────────────────────${RESET}`);
  console.log(
    `  ${BOLD}${"Tier".padEnd(42)} ${"Status".padEnd(10)} ${"Passed".padEnd(8)} ${"Failed".padEnd(8)} ${"Time".padStart(8)}${RESET}`
  );
  console.log(`  ${GRAY}${"─".repeat(40)} ${"─".repeat(8)} ${"─".repeat(6)} ${"─".repeat(6)} ${"─".repeat(8)}${RESET}`);

  for (const r of results) {
    const statusStr = r.success ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    const nameStr = r.tier.name.slice(0, 40).padEnd(40);
    const passedStr = r.stats.passCount.toString().padEnd(6);
    const failedStr = r.stats.failCount.toString().padEnd(6);
    const timeStr = `${r.stats.durationMs.toFixed(0)}ms`.padStart(8);
    console.log(`  ${nameStr}   ${statusStr.padEnd(19)} ${passedStr}   ${failedStr}   ${timeStr}`);
  }

  console.log(`${BOLD}───────────────────────────────────────────────────────────────────────${RESET}`);
  console.log(
    `  ${BOLD}${"TOTAL STATS".padEnd(42)} ${allPassed ? `${GREEN}ALL PASS${RESET}` : `${RED}FAILURES${RESET}`}   ${totalPassed
      .toString()
      .padEnd(6)}   ${totalFailed.toString().padEnd(6)}   ${`${totalWallDuration}ms`.padStart(8)}${RESET}`
  );
  console.log(`${BOLD}───────────────────────────────────────────────────────────────────────${RESET}\n`);

  if (allPassed) {
    console.log(`  ${BG_GREEN}${BOLD} SUCCESS ${RESET} ${GREEN}All ${totalPassed} tests passed across ${results.length} tier(s).${RESET}\n`);
    process.exit(0);
  } else {
    console.log(
      `  ${BG_RED}${BOLD} FAILURE ${RESET} ${RED}${totalFailed} test(s) failed across ${results.length} tier(s).${RESET}\n`
    );
    process.exit(1);
  }
}

main();
