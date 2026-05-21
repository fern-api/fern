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
});
