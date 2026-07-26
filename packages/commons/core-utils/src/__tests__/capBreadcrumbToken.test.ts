import { describe, expect, test } from "vitest";

import { capBreadcrumbToken } from "../capBreadcrumbToken.js";

describe("capBreadcrumbToken", () => {
    test("returns short tokens unchanged", () => {
        expect(capBreadcrumbToken("WorkbookSpec")).toBe("WorkbookSpec");
        expect(capBreadcrumbToken("")).toBe("");
    });

    test("leaves a token at the length boundary unchanged", () => {
        const atLimit = "a".repeat(512);
        expect(capBreadcrumbToken(atLimit)).toBe(atLimit);
    });

    test("caps a token past the limit to at most the maximum length", () => {
        const long = "a".repeat(300_000);
        const capped = capBreadcrumbToken(long);
        expect(capped.length).toBeLessThanOrEqual(512);
        expect(capped.startsWith("a".repeat(100))).toBe(true);
    });

    test("is idempotent: capping an already-capped token is a no-op", () => {
        const long = "a".repeat(300_000);
        const capped = capBreadcrumbToken(long);
        expect(capBreadcrumbToken(capped)).toBe(capped);
    });

    test("is deterministic and distinguishes tokens sharing a prefix", () => {
        const a = `${"x".repeat(600)}A`;
        const b = `${"x".repeat(600)}B`;
        expect(capBreadcrumbToken(a)).toBe(capBreadcrumbToken(a));
        expect(capBreadcrumbToken(a)).not.toBe(capBreadcrumbToken(b));
    });
});
