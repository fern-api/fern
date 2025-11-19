import { cp } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { build as tsup } from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

main();

async function main() {
  await tsup({
    entry: ["src/cli.ts"],
    format: ["cjs"],
    minify: false,
    outDir: "dist",
    sourcemap: true,
    clean: true,
  });
  const filesFoldersToCopy = [
    ["../features.yml", "./dist/assets/features.yml"],
    [
      "../../asIs/readme/binary-response-addendum.md",
      "./dist/assets/readme/binary-response-addendum.md",
    ],
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
