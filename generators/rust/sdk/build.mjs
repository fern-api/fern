import { mkdir, cp } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { build as tsup } from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

main();

async function main() {
  // Build with tsdown
  await tsup({
    entry: ["src/cli.ts"],
    format: ["cjs"],
    noExternal: [/@fern-api\/.*/, /dedent/],
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: true,
    outDir: "dist"
  });

  // Copy necessary files
  const filesFoldersToCopy = [
    ["./features.yml", "./dist/assets/features.yml"],
    ["../base/src/asIs", "./dist/asIs"]
  ];

  for (const [source, destination] of filesFoldersToCopy) {
    const destDir = dirname(join(__dirname, destination));
    await mkdir(destDir, { recursive: true });
    await cp(join(__dirname, source), join(__dirname, destination), {
      recursive: true,
      force: true,
    });
  }
}
