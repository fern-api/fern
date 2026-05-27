import { readdirSync, readFileSync } from "fs";
import path from "path";
import url from "url";
import { describe, expect, it } from "vitest";

// Files in sdk/src/ ship verbatim to user output. Any include_str! /
// include_bytes! / include! whose path resolves outside the sdk/src/
// tree resolves at codegen time against paths pruned by SDK_IGNORE —
// the generated CLI then fails `cargo build --locked --all-features
// --tests` at the include_* site. See the overlay.rs leak fixed
// alongside this test.
const SDK_SRC_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../../sdk/src");
// The optional raw-string prefix (`r`, `r#`, `r##`) matters because forms like
// `include_str!(r#"…"#)` would slip past a regex demanding a bare `"` after the paren. The
// path is validated by resolving it against the containing file's directory rather than
// pattern-matching `../`: Rust resolves include_* paths relative to the source file, so a
// single `../` escape from a depth-1 file leaks just as `../../` does from depth-2.
const INCLUDE_MACRO = /(?<macro>include_str|include_bytes|include)!\s*\(\s*(?<rawPrefix>r#*)?"(?<includePath>[^"]+)"/g;

describe("sdk template hygiene", () => {
    it("no include_*! in sdk/src/ resolves outside the sdk/src tree", () => {
        const violations: string[] = [];
        for (const entry of readdirSync(SDK_SRC_ROOT, { recursive: true, withFileTypes: true })) {
            if (!entry.isFile() || !entry.name.endsWith(".rs")) {
                continue;
            }
            const absPath = path.join(entry.parentPath, entry.name);
            const contents = readFileSync(absPath, "utf-8");
            for (const match of contents.matchAll(INCLUDE_MACRO)) {
                const includePath = match.groups?.includePath;
                if (includePath == null) {
                    continue;
                }
                const resolved = path.resolve(path.dirname(absPath), includePath);
                if (resolved !== SDK_SRC_ROOT && !resolved.startsWith(SDK_SRC_ROOT + path.sep)) {
                    const rawPrefix = match.groups?.rawPrefix ?? "";
                    violations.push(
                        `${path.relative(SDK_SRC_ROOT, absPath)}: ${match.groups?.macro}!(${rawPrefix}"${includePath}") → ${resolved}`
                    );
                }
            }
        }
        expect(violations, `Found include_* macros escaping sdk/src/:\n${violations.join("\n")}`).toEqual([]);
    });
});
