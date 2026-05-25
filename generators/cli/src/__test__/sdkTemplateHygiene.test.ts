import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import url from "url";
import { describe, expect, it } from "vitest";

// Files in sdk/src/ ship verbatim to user output. Any include_str! /
// include_bytes! / include! that escapes the sdk/src/ tree via `../../`
// resolves at codegen time against paths that SDK_IGNORE prunes — the
// generated CLI then fails `cargo build --locked --all-features --tests`
// at the include_* site. See the overlay.rs leak fixed alongside this test.
const SDK_SRC_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../../sdk/src");
const INCLUDE_MACRO = /(include_str|include_bytes|include)!\s*\(\s*"(\.\.\/\.\.\/[^"]*)"/g;

describe("sdk template hygiene", () => {
    it("no include_*! in sdk/src/ escapes the sdk/src tree via ../../", () => {
        const violations: string[] = [];
        for (const entry of readdirSync(SDK_SRC_ROOT, { recursive: true, encoding: "utf-8" })) {
            if (!entry.endsWith(".rs")) continue;
            const absPath = path.join(SDK_SRC_ROOT, entry);
            if (!statSync(absPath).isFile()) continue;
            const contents = readFileSync(absPath, "utf-8");
            for (const match of contents.matchAll(INCLUDE_MACRO)) {
                violations.push(`${entry}: ${match[1]}!("${match[2]}")`);
            }
        }
        expect(violations, `Found include_* macros escaping sdk/src/:\n${violations.join("\n")}`).toEqual([]);
    });
});
