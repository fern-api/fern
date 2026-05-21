import { describe, expect, it } from "vitest";

import { expandFernignorePatterns } from "../expandFernignorePatterns.js";

describe("expandFernignorePatterns", () => {
    it("expands ** glob across nested files", () => {
        const fernignore = "src/foo/**";
        const tracked = ["src/foo/keep.py", "src/foo/nested/also.py", "src/bar/del.py"];

        const preserved = expandFernignorePatterns(fernignore, tracked);

        expect(preserved).toEqual(["src/foo/keep.py", "src/foo/nested/also.py"]);
    });

    it("matches a literal file path", () => {
        const fernignore = "LICENSE";
        const tracked = ["LICENSE", "README.md", "src/index.ts"];

        const preserved = expandFernignorePatterns(fernignore, tracked);

        expect(preserved).toEqual(["LICENSE"]);
    });

    it("treats a bare directory path as a prefix so its contents are preserved", () => {
        const fernignore = "src/foo";
        const tracked = ["src/foo/a.py", "src/foo/nested/b.py", "src/bar/c.py"];

        const preserved = expandFernignorePatterns(fernignore, tracked);

        expect(preserved).toEqual(["src/foo/a.py", "src/foo/nested/b.py"]);
    });

    it("trims whitespace and ignores comments and blank lines", () => {
        const fernignore = ["# leading comment", "", "  src/foo/**  ", "   ", "# trailing comment"].join("\n");
        const tracked = ["src/foo/a.py", "src/bar/b.py"];

        const preserved = expandFernignorePatterns(fernignore, tracked);

        expect(preserved).toEqual(["src/foo/a.py"]);
    });
});
