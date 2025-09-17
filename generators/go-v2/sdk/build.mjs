import { join, dirname } from "path";
import { cp } from "fs/promises";
import { fileURLToPath } from "url";
import tsup from "tsup";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

main();

async function main() {
  await tsup.build({
    entry: ["src/cli.ts"],
    format: ["cjs"],
    minify: false,
    outDir: "dist",
    sourcemap: true,
    clean: true,
  });
  const filesFoldersToCopy = [
    ["../base/src/asIs", "./dist/asIs"],
  ];
  for (const [source, destination] of filesFoldersToCopy) {
    await cp(join(__dirname, source), join(__dirname, destination), {
      recursive: true,
      force: true,
    });
  }
}