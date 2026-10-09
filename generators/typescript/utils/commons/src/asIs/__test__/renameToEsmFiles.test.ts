import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

// The as-is script is copied verbatim into every generated SDK and run as
// `node scripts/rename-to-esm-files.js <dist/esm>` during the ESM build. We
// exercise it as a black box so the test mirrors exactly how it runs in a
// generated SDK.
const SCRIPT_PATH = fileURLToPath(new URL("../../../../../asIs/scripts/rename-to-esm-files.js", import.meta.url));

describe("rename-to-esm-files", () => {
    let dir: string;

    beforeEach(() => {
        dir = mkdtempSync(path.join(tmpdir(), "rename-to-esm-"));
    });

    afterEach(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    function write(relativePath: string, contents: string): void {
        const absolute = path.join(dir, relativePath);
        mkdirSync(path.dirname(absolute), { recursive: true });
        writeFileSync(absolute, contents, "utf8");
    }

    function run(): void {
        execFileSync("node", [SCRIPT_PATH, dir], { stdio: "ignore" });
    }

    function read(relativePath: string): string {
        return readFileSync(path.join(dir, relativePath), "utf8");
    }

    it("rewrites an extensionless static file import to a .mjs specifier", () => {
        write("client.js", "export const client = 1;\n");
        write("index.js", 'export * from "./client";\n');

        run();

        expect(read("index.mjs")).toBe('export * from "./client.mjs";\n');
    });

    it("rewrites a bare directory import to its index.mjs", () => {
        write("oauth/index.js", "export const oauth = 1;\n");
        write("index.js", 'import { oauth } from "./oauth";\n');

        run();

        expect(read("index.mjs")).toBe('import { oauth } from "./oauth/index.mjs";\n');
    });

    it("rewrites single-dot (./) and parent (../) dynamic imports", () => {
        write("client.js", "export const client = 1;\n");
        write("nested/shared.js", "export const shared = 1;\n");
        write(
            "nested/index.js",
            'const a = await import("../client");\nconst b = await import("./shared");\n'
        );

        run();

        expect(read("nested/index.mjs")).toBe(
            'const a = await import("../client.mjs");\nconst b = await import("./shared.mjs");\n'
        );
    });

    it("resolves a dot-named directory to its index.mjs instead of treating the dot as an extension", () => {
        write("v1.5/index.js", "export const v = 1;\n");
        write("index.js", 'import { d } from "./v1.5";\n');

        run();

        expect(read("index.mjs")).toBe('import { d } from "./v1.5/index.mjs";\n');
    });

    it("does not double-rewrite specifiers that already carry a .js extension", () => {
        write("client.js", "export const client = 1;\n");
        write("index.js", 'export * from "./client.js";\n');

        run();

        expect(read("index.mjs")).toBe('export * from "./client.mjs";\n');
    });

    it("leaves non-code extensionful specifiers (e.g. .json) untouched", () => {
        write("data.json", "{}\n");
        write("index.js", 'import data from "./data.json";\n');

        run();

        expect(read("index.mjs")).toBe('import data from "./data.json";\n');
    });
});
