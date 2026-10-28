import { describe, expect, it } from "vitest";

import { getDuplicateTargetLanguageIndexes } from "../getDuplicateTargetLanguageIndexes.js";

describe("getDuplicateTargetLanguageIndexes", () => {
    it("assigns contiguous indexes within each duplicate language", () => {
        expect(
            getDuplicateTargetLanguageIndexes([
                { language: "typescript" },
                { language: "python" },
                { language: "typescript" },
                { language: "java" },
                { language: "python" }
            ])
        ).toEqual([0, 0, 1, undefined, 1]);
    });
});
