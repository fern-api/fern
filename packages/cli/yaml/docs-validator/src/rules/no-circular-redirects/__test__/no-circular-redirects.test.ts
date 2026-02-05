import { describe, expect, it } from "vitest";

import { detectCircularRedirects } from "../no-circular-redirects";

describe("detectCircularRedirects", () => {
    it("should return no violations for valid redirects", () => {
        const redirects = [
            { source: "/foo", destination: "/bar" },
            { source: "/baz", destination: "/qux" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(0);
    });

    it("should detect self-redirect (source equals destination)", () => {
        const redirects = [{ source: "/foo", destination: "/foo" }];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("infinite loop");
        expect(violations[0]?.message).toContain("source equals destination");
    });

    it("should detect self-redirect with trailing slash difference", () => {
        const redirects = [{ source: "/foo", destination: "/foo/" }];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("infinite loop");
    });

    it("should detect simple circular chain (A -> B -> A)", () => {
        const redirects = [
            { source: "/foo", destination: "/bar" },
            { source: "/bar", destination: "/foo" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("Circular redirect chain");
        expect(violations[0]?.message).toContain("/foo");
        expect(violations[0]?.message).toContain("/bar");
    });

    it("should detect longer circular chain (A -> B -> C -> A)", () => {
        const redirects = [
            { source: "/a", destination: "/b" },
            { source: "/b", destination: "/c" },
            { source: "/c", destination: "/a" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("Circular redirect chain");
    });

    it("should not report false positives for non-circular chains", () => {
        const redirects = [
            { source: "/a", destination: "/b" },
            { source: "/b", destination: "/c" },
            { source: "/c", destination: "/d" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(0);
    });

    it("should skip dynamic redirects (with path parameters)", () => {
        const redirects = [
            { source: "/foo/:id", destination: "/bar/:id" },
            { source: "/bar/:id", destination: "/foo/:id" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(0);
    });

    it("should detect self-redirect even with dynamic segments", () => {
        const redirects = [{ source: "/foo/:id", destination: "/foo/:id" }];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("infinite loop");
    });

    it("should handle empty redirects array", () => {
        const violations = detectCircularRedirects([]);
        expect(violations).toHaveLength(0);
    });

    it("should handle mixed static and dynamic redirects", () => {
        const redirects = [
            { source: "/foo", destination: "/bar" },
            { source: "/bar", destination: "/foo" },
            { source: "/dynamic/:id", destination: "/other/:id" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("Circular redirect chain");
    });

    it("should detect multiple separate circular chains", () => {
        const redirects = [
            { source: "/a", destination: "/b" },
            { source: "/b", destination: "/a" },
            { source: "/x", destination: "/y" },
            { source: "/y", destination: "/x" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(2);
    });

    it("should not duplicate reports for the same cycle", () => {
        const redirects = [
            { source: "/a", destination: "/b" },
            { source: "/b", destination: "/c" },
            { source: "/c", destination: "/a" }
        ];
        const violations = detectCircularRedirects(redirects);
        expect(violations).toHaveLength(1);
    });
});
