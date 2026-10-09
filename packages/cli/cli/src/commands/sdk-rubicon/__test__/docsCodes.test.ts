import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { FIXTURES } from "./helpers.js";

const COMMAND_DIRECTORY = join(FIXTURES, "..", "..");
/** A diagnostic code is a quoted string in the source, and a backticked cell in the README table. */
const SOURCE_CODE = /"(RUBICON_[A-Z_]+)"/g;
const README_CODE = /`(RUBICON_[A-Z_]+)`/g;

async function sourceFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
        entries.map(async (entry) => {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                return entry.name === "__test__" ? [] : sourceFiles(path);
            }
            return entry.name.endsWith(".ts") ? [path] : [];
        })
    );
    return nested.flat();
}

describe("README diagnostic codes", () => {
    it("documents every code the command emits, and no other", async () => {
        const sources = await Promise.all((await sourceFiles(COMMAND_DIRECTORY)).map((path) => readFile(path, "utf8")));
        const emitted = new Set(
            sources.flatMap((source) => [...source.matchAll(SOURCE_CODE)].map((match) => match[1]))
        );
        const readme = await readFile(join(COMMAND_DIRECTORY, "README.md"), "utf8");
        const start = readme.indexOf("## Diagnostic codes");
        const table = readme.slice(start, readme.indexOf("\n## ", start + 1));
        const documented = new Set([...table.matchAll(README_CODE)].map((match) => match[1]));
        expect([...documented].sort()).toEqual([...emitted].sort());
    });
});
