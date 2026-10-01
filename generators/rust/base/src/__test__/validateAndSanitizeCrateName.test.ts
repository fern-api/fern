import { describe, expect, it } from "vitest";
import { validateAndSanitizeCrateName } from "../utils/index.js";

describe("validateAndSanitizeCrateName", () => {
    it("converts hyphens to underscores by default", () => {
        expect(validateAndSanitizeCrateName("anduril-lattice-sdk")).toBe("anduril_lattice_sdk");
        expect(validateAndSanitizeCrateName("My-SDK__name")).toBe("my_sdk_name");
    });

    it("keeps hyphens when preserveHyphens is set", () => {
        expect(validateAndSanitizeCrateName("anduril-lattice-sdk", { preserveHyphens: true })).toBe(
            "anduril-lattice-sdk"
        );
        expect(validateAndSanitizeCrateName("my_sdk", { preserveHyphens: true })).toBe("my_sdk");
    });

    it("still sanitizes invalid characters and separators when preserveHyphens is set", () => {
        expect(validateAndSanitizeCrateName("My SDK--Name", { preserveHyphens: true })).toBe("my_sdk-name");
        expect(validateAndSanitizeCrateName("-my-sdk_", { preserveHyphens: true })).toBe("my-sdk");
        expect(validateAndSanitizeCrateName("--", { preserveHyphens: true })).toBe("rust_sdk");
    });
});
