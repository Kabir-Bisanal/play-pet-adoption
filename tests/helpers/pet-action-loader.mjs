import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadPetManagementAction(projectDir = process.cwd(), mockSupabaseClient = null) {
  const actionPath = path.join(projectDir, "src", "app", "actions", "pet-management.ts");
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
    `const createServerSupabaseClient = async () => globalThis.__mockPetSupabaseClient || null;
     const getSupabaseAdminClient = () => globalThis.__mockPetSupabaseClient || null;`
  );

  // Replace @/data/pets
  code = code.replace(/@\/data\/pets/g, "../src/data/pets.ts");

  // Replace @/lib/supabase/types
  code = code.replace(/@\/lib\/supabase\/types/g, "../src/lib/supabase/types.ts");

  // Replace @/lib/pet-utils
  code = code.replace(/@\/lib\/pet-utils/g, "../src/lib/pet-utils.ts");

  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const tempFilePath = path.join(
    projectDir,
    "tests",
    `.tmp-test-pet-mgmt-${Date.now()}-${Math.random().toString(36).substring(7)}.mjs`
  );
  fs.writeFileSync(tempFilePath, transpiled.outputText, "utf-8");

  globalThis.__mockPetSupabaseClient = mockSupabaseClient;

  try {
    const mod = await import(pathToFileURL(tempFilePath).href);
    return {
      mod,
      setMockClient: (client) => {
        globalThis.__mockPetSupabaseClient = client;
      },
      cleanup: () => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {}
        delete globalThis.__mockPetSupabaseClient;
      },
    };
  } catch (err) {
    try {
      fs.unlinkSync(tempFilePath);
    } catch {}
    delete globalThis.__mockPetSupabaseClient;
    throw err;
  }
}
