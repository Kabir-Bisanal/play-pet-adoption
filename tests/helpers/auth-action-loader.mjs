import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadAuthAction(projectDir = process.cwd(), mockSupabaseClient = null) {
  const actionPath = path.join(projectDir, "src", "app", "actions", "auth.ts");
  let code = fs.readFileSync(actionPath, "utf-8");

  // Remove "use server" directive
  code = code.replace(/^"use server";\s*/m, "");

  // Mock redirect from next/navigation
  code = code.replace(
    /import\s*\{\s*redirect\s*\}\s*from\s*["']next\/navigation["'];?/,
    "const redirect = (path) => { const err = new Error('NEXT_REDIRECT: ' + path); err.digest = 'NEXT_REDIRECT;replace;' + path; throw err; };"
  );

  // Mock createServerSupabaseClient
  code = code.replace(
    /import\s*\{[^}]*createServerSupabaseClient[^}]*\}\s*from\s*["'][^"']+["'];?/,
    `const createServerSupabaseClient = async () => globalThis.__mockSupabaseClient || null;`
  );

  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const tempFilePath = path.join(projectDir, "tests", `.tmp-test-auth-${Date.now()}-${Math.random().toString(36).substring(7)}.mjs`);
  fs.writeFileSync(tempFilePath, transpiled.outputText, "utf-8");

  globalThis.__mockSupabaseClient = mockSupabaseClient;

  try {
    const mod = await import(pathToFileURL(tempFilePath).href);
    return {
      mod,
      setMockClient: (client) => {
        globalThis.__mockSupabaseClient = client;
      },
      cleanup: () => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {}
        delete globalThis.__mockSupabaseClient;
      },
    };
  } catch (err) {
    try {
      fs.unlinkSync(tempFilePath);
    } catch {}
    delete globalThis.__mockSupabaseClient;
    throw err;
  }
}
