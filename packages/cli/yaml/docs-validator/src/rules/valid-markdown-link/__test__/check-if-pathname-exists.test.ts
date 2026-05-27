import { describe, expect, it } from "vitest";

import { withBasePathPrepended } from "../with-base-path-prepended.js";

describe("specialDocPages slug registration", () => {
    const specialDocPages = [
        "/llms-full.txt",
        "/llms.txt",
        "/openapi.json",
        "/openapi.yaml",
        "/openapi.yml",
        "/asyncapi.json",
        "/asyncapi.yaml",
        "/asyncapi.yml"
    ];

    function stripLeadingSlash(s: string): string {
        return s.startsWith("/") ? s.slice(1) : s;
    }

    it("all special pages produce valid slugs without basePath", () => {
        const visitableSlugs = new Set<string>();
        for (const page of specialDocPages) {
            visitableSlugs.add(stripLeadingSlash(page));
        }
        for (const page of specialDocPages) {
            expect(visitableSlugs.has(stripLeadingSlash(page))).toBe(true);
        }
    });

    it("all special pages produce valid slugs with basePath", () => {
        const basePath = "/docs";
        const visitableSlugs = new Set<string>();
        for (const page of specialDocPages) {
            const pageWithBasePath = `${stripLeadingSlash(basePath)}${page}`;
            visitableSlugs.add(pageWithBasePath);
        }
        for (const page of specialDocPages) {
            const prefixed = withBasePathPrepended(page, basePath);
            expect(prefixed).not.toBeNull();
            if (prefixed != null) {
                expect(visitableSlugs.has(prefixed)).toBe(true);
            }
        }
    });
});

describe("withBasePathPrepended", () => {
    it("returns null when no basePath is configured", () => {
        expect(withBasePathPrepended("/about", undefined)).toBeNull();
    });

    it("returns null when basePath is empty or just `/`", () => {
        expect(withBasePathPrepended("/about", "/")).toBeNull();
        expect(withBasePathPrepended("/about", "")).toBeNull();
    });

    it("prepends a single-segment basePath to a site-relative path", () => {
        expect(withBasePathPrepended("/about", "/docs")).toBe("docs/about");
    });

    it("prepends a multi-segment basePath to a site-relative path", () => {
        // Repro for the Gym regression: `/latest/about` on a site with basePath
        // `/nemo/gym` should resolve to `nemo/gym/latest/about` in pageSlugs.
        expect(withBasePathPrepended("/latest/about", "/nemo/gym")).toBe("nemo/gym/latest/about");
    });

    it("returns null when the path already starts with the basePath", () => {
        expect(withBasePathPrepended("/nemo/gym/about", "/nemo/gym")).toBeNull();
        expect(withBasePathPrepended("/nemo/gym", "/nemo/gym")).toBeNull();
    });

    it("does not double-prepend when the path is exactly the basePath", () => {
        expect(withBasePathPrepended("/docs", "/docs")).toBeNull();
    });

    it("handles basePath without leading or trailing slashes", () => {
        expect(withBasePathPrepended("/about", "docs")).toBe("docs/about");
        expect(withBasePathPrepended("/about", "/docs/")).toBe("docs/about");
        expect(withBasePathPrepended("/about", "docs/")).toBe("docs/about");
    });

    it("still prepends when the path starts with a segment that only shares a prefix with basePath", () => {
        // `docs-v2/about` must not match `docs/...` — the basePath segment must be
        // followed by `/` to be considered already-prefixed.
        expect(withBasePathPrepended("/docs-v2/about", "/docs")).toBe("docs/docs-v2/about");
    });
});
