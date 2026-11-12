import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadAdoptRouteModule(projectDir = process.cwd()) {
  const pageTsxPath = path.join(projectDir, "src", "app", "adopt", "[id]", "page.tsx");
  if (!fs.existsSync(pageTsxPath)) {
    throw new Error(`Route file not found: ${pageTsxPath}`);
  }

  let code = fs.readFileSync(pageTsxPath, "utf-8");

  // Export getPetByIdOrCode if it is not exported
  code = code.replace(/function\s+getPetByIdOrCode\s*\(/g, "export function getPetByIdOrCode(");

  // Remap path aliases and Next.js internal imports for Node ESM runtime
  code = code.replace(/from\s+["']@\/data\/pets["']/g, `from "${pathToFileURL(path.join(projectDir, "src", "data", "pets.ts")).href}"`);
  code = code.replace(/from\s+["']@\/config\/site["']/g, `from "${pathToFileURL(path.join(projectDir, "src", "config", "site.ts")).href}"`);
  code = code.replace(/from\s+["']next\/navigation["']/g, 'from "next/navigation.js"');
  code = code.replace(/from\s+["']next\/link["']/g, 'from "next/link.js"');
  code = code.replace(/from\s+["']@\/components\/[A-Za-z0-9_-]+["']/g, 'from "react"');

  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });

  const tempFilePath = path.join(projectDir, "tests", `.tmp-test-adopt-page-${Date.now()}.mjs`);
  fs.writeFileSync(tempFilePath, transpiled.outputText, "utf-8");

  try {
    const mod = await import(pathToFileURL(tempFilePath).href);
    return { mod, cleanup: () => { try { fs.unlinkSync(tempFilePath); } catch {} } };
  } catch (err) {
    try { fs.unlinkSync(tempFilePath); } catch {}
    throw err;
  }
}
