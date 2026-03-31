import { describe, expect, it } from "vitest";
import { deduplicateExamples } from "../deduplicateExamples.js";

describe("deduplicateExamples", () => {
    it("returns empty array for empty input", () => {
        expect(deduplicateExamples([])).toEqual([]);
    });

    it("returns single example unchanged", () => {
        const examples = ["@example\n    {\n        page: 1\n    }"];
        expect(deduplicateExamples(examples)).toEqual(examples);
    });

    it("removes duplicate examples", () => {
        const example = "@example\n    {\n        page: 1\n    }";
        expect(deduplicateExamples([example, example, example])).toEqual([example]);
    });

    it("preserves order of first occurrences", () => {
        const example1 = "@example\n    {\n        page: 1\n    }";
        const example2 = "@example\n    {\n        page: 2\n    }";
        expect(deduplicateExamples([example1, example2, example1])).toEqual([example1, example2]);
    });

    it("keeps distinct examples", () => {
        const example1 = "@example\n    {\n        awayModeEnabled: true\n    }";
        const example2 = "@example\n    {\n        awayModeEnabled: false\n    }";
        expect(deduplicateExamples([example1, example2])).toEqual([example1, example2]);
    });

    it("treats whitespace differences as distinct", () => {
        const example1 = "@example\n    { page: 1 }";
        const example2 = "@example\n    {  page: 1 }";
        expect(deduplicateExamples([example1, example2])).toEqual([example1, example2]);
    });

    it("handles multiline examples with exact duplicates", () => {
        const example =
            "@example\n" +
            "    {\n" +
            "        awayModeEnabled: true,\n" +
            "        awayModeReassign: true\n" +
            "    }";
        expect(deduplicateExamples([example, example, example])).toEqual([example]);
    });
});
