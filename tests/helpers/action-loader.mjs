import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadAdoptionAction(projectDir = process.cwd()) {
  const actionPath = path.join(projectDir, "src", "app", "actions", "adoption.ts");
  let code = fs.readFileSync(actionPath, "utf-8");

  // Remove "use server" directive
  code = code.replace(/^"use server";\s*/m, "");

  // Mock getSupabaseServerClient for test execution
  code = code.replace(
    /import\s*\{[^}]*getSupabaseServerClient[^}]*\}\s*from\s*["'][^"']+["'];?/,
    "const getSupabaseServerClient = () => null;"
  );

  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const tempFilePath = path.join(projectDir, "tests", `.tmp-test-action-${Date.now()}.mjs`);
  fs.writeFileSync(tempFilePath, transpiled.outputText, "utf-8");

  try {
    const mod = await import(pathToFileURL(tempFilePath).href);
    return {
      mod,
      cleanup: () => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {}
      },
    };
  } catch (err) {
    try {
      fs.unlinkSync(tempFilePath);
    } catch {}
    throw err;
  }
}
