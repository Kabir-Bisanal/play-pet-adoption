import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadApplicationsAction(projectDir = process.cwd(), mockSupabaseClient = null) {
  const actionPath = path.join(projectDir, "src", "app", "actions", "applications.ts");
  let code = fs.readFileSync(actionPath, "utf-8");

  // Remove "use server" directive
  code = code.replace(/^"use server";\s*/m, "");

  // Mock revalidatePath
  code = code.replace(
    /import\s*\{\s*revalidatePath\s*\}\s*from\s*["']next\/cache["'];?/,
    "const revalidatePath = () => {};"
  );

  // Mock server clients
  code = code.replace(
    /import\s*\{[^}]*createServerSupabaseClient[^}]*\}\s*from\s*["'][^"']+["'];?/,
    `const createServerSupabaseClient = async () => globalThis.__mockAppSupabaseClient || null;
     const getSupabaseAdminClient = () => globalThis.__mockAppSupabaseClient || null;`
  );

  // Replace @/lib/supabase/types
  code = code.replace(/@\/lib\/supabase\/types/g, "../src/lib/supabase/types.ts");

  // Replace @/data/sample-applications
  code = code.replace(/@\/data\/sample-applications/g, "../src/data/sample-applications.ts");

  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const tempFilePath = path.join(
    projectDir,
    "tests",
    `.tmp-test-apps-${Date.now()}-${Math.random().toString(36).substring(7)}.mjs`
  );
  fs.writeFileSync(tempFilePath, transpiled.outputText, "utf-8");

  globalThis.__mockAppSupabaseClient = mockSupabaseClient;

  try {
    const actionModule = await import(pathToFileURL(tempFilePath).href);
    return {
      actionModule,
      cleanup: () => {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch {}
      },
    };
  } catch (err) {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw err;
  }
}
