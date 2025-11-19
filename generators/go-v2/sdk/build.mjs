import { cp } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { build as tsup } from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

main();

async function main() {
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
