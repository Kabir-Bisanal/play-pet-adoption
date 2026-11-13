import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadAdminDataModule(projectDir = process.cwd()) {
  const adminTsPath = path.join(projectDir, "src", "lib", "admin.ts");
  let code = fs.readFileSync(adminTsPath, "utf-8");

  // Replace @/ paths with relative paths with .ts extension for Node experimental strip types
  code = code.replace(/@\/data\/pets/g, "../src/data/pets.ts");
  code = code.replace(/@\/data\/content/g, "../src/data/content.ts");

  // Mock getSupabaseServerClient
  code = code.replace(
    /import\s*\{[^}]*getSupabaseServerClient[^}]*\}\s*from\s*["'][^"']+["'];?/,
    "const getSupabaseServerClient = () => globalThis.__mockAdminSupabaseClient || null;"
  );

  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const tempFilePath = path.join(projectDir, "tests", `.tmp-test-admin-data-${Date.now()}-${Math.random().toString(36).substring(7)}.mjs`);
  fs.writeFileSync(tempFilePath, transpiled.outputText, "utf-8");

  try {
    const mod = await import(pathToFileURL(tempFilePath).href);
    return {
      mod,
      setMockClient: (client) => {
        globalThis.__mockAdminSupabaseClient = client;
      },
      cleanup: () => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {}
        delete globalThis.__mockAdminSupabaseClient;
      },
    };
  } catch (err) {
    try {
      fs.unlinkSync(tempFilePath);
    } catch {}
    delete globalThis.__mockAdminSupabaseClient;
    throw err;
  }
}
