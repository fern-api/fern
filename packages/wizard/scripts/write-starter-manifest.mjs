// biome-ignore-all lint/suspicious/noConsole: a command-line script that reports what it wrote.
// Lists every file of the docs starter, with its size and SHA-256, in templates/docs-starter/manifest.json.
// The CLI downloads the starter file by file and checks each one against this list, so run this
// whenever the starter changes: node scripts/write-starter-manifest.mjs
import { createHash } from "crypto";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const starterDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "templates", "docs-starter");
// Not part of the starter itself.
const SKIPPED = new Set(["manifest.json", "SOURCE.md"]);

async function listFiles(dir, prefix = "") {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const relative = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...(await listFiles(path.join(dir, entry.name), relative)));
        } else if (!SKIPPED.has(relative)) {
            files.push(relative);
        }
    }
    return files;
}

const files = [];
for (const relative of (await listFiles(starterDir)).sort()) {
    const contents = await readFile(path.join(starterDir, relative));
    files.push({ path: relative, size: contents.length, sha256: createHash("sha256").update(contents).digest("hex") });
}
await writeFile(path.join(starterDir, "manifest.json"), `${JSON.stringify({ files }, null, 2)}\n`);
console.log(`Wrote ${files.length} files to templates/docs-starter/manifest.json`);
