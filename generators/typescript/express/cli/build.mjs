import { join, dirname } from "path";
import { cp } from "fs/promises";
import { fileURLToPath } from "url";
import tsup from "tsdown";

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
    ["../../asIs/", "./dist/assets/asIs"],
    ["../../utils/core-utilities/", "./dist/assets/core-utilities"],
  ];
  for (const [source, destination] of filesFoldersToCopy) {
    await cp(join(__dirname, source), join(__dirname, destination), {
      recursive: true,
      force: true,
    });
  }
}
