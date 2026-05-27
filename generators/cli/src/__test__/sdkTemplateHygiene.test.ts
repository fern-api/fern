import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import url from "url";
import { describe, expect, it } from "vitest";

// Files in sdk/src/ ship verbatim to user output. Any include_str! /
// include_bytes! / include! whose path resolves outside the sdk/src/
// tree resolves at codegen time against paths that SDK_IGNORE prunes —
// the generated CLI then fails `cargo build --locked --all-features
// --tests` at the include_* site. See the overlay.rs leak fixed
// alongside this test.
const SDK_SRC_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../../sdk/src");
// Captures the macro name (group 1), an optional raw-string prefix (group 2, e.g. `r`, `r#`,
// `r##`), and the path (group 3). Raw-string forms like `include_str!(r"…")` or
// `include_str!(r#"…"#)` bypass a regex that requires a bare `"` directly after the paren.
// The path is matched loosely (any literal) and validated by resolving it against the
// containing file's directory — Rust resolves include_* paths relative to the source file,
// so a single `../` escape from a depth-1 file (e.g. sdk/src/app.rs) leaks just as a
// `../../` escape from a depth-2 file does. Resolve-and-contain catches both.
const INCLUDE_MACRO = /(include_str|include_bytes|include)!\s*\(\s*(r#*)?"([^"]+)"/g;

describe("sdk template hygiene", () => {
    it("no include_*! in sdk/src/ resolves outside the sdk/src tree", () => {
        const violations: string[] = [];
        for (const entry of readdirSync(SDK_SRC_ROOT, { recursive: true, encoding: "utf-8" })) {
            if (!entry.endsWith(".rs")) {
                continue;
            }
            const absPath = path.join(SDK_SRC_ROOT, entry);
            if (!statSync(absPath).isFile()) {
                continue;
            }
            const contents = readFileSync(absPath, "utf-8");
            for (const match of contents.matchAll(INCLUDE_MACRO)) {
                const resolved = path.resolve(path.dirname(absPath), match[3]);
                if (resolved !== SDK_SRC_ROOT && !resolved.startsWith(SDK_SRC_ROOT + path.sep)) {
                    violations.push(`${entry}: ${match[1]}!(${match[2] ?? ""}"${match[3]}") → ${resolved}`);
                }
            }
        }
        expect(violations, `Found include_* macros escaping sdk/src/:\n${violations.join("\n")}`).toEqual([]);
    });
});
