import { describe, expect, it } from "vitest";

import { PublishedPage, validateLlmsTxtContent } from "../validate-llms-txt-content.js";

const RULE_NAME = "valid-llms-txt";
const BASE_PATH = "docs";
const INSTANCE_URLS = ["plantstore.docs.buildwithfern.com/docs"];

const publishedPages: PublishedPage[] = [
    { pageId: "get-started.mdx", title: "Get started", slugs: ["docs/get-started"] },
    { pageId: "plants/watering.mdx", title: "Watering your plant", slugs: ["docs/plants/watering"] },
    { pageId: "plants/pruning.mdx", title: "Pruning", slugs: ["docs/plants/pruning"] }
];

const existingSlugs = new Set(["docs/get-started", "docs/plants/watering", "docs/plants/pruning"]);
const redirectSources = new Set(["docs/old-guide"]);

/**
 * Stand-in for `checkIfPathnameExists`: a target exists if it matches a known
 * slug (with or without the basePath) or a redirect source. Mirrors the
 * basePath/redirect resolution the real checker performs so these tests stay
 * decoupled from the docs resolver.
 */
function fakePathnameExists(existing = existingSlugs, redirects = redirectSources) {
    return async (pathname: string): Promise<boolean> => {
        const bare = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
        return [bare, `${BASE_PATH}/${bare}`].some((candidate) => existing.has(candidate) || redirects.has(candidate));
    };
}

function validate(
    content: string,
    overrides: Partial<Parameters<typeof validateLlmsTxtContent>[0]> = {}
): ReturnType<typeof validateLlmsTxtContent> {
    return validateLlmsTxtContent({
        content,
        fileLabel: "llms.txt",
        ruleName: RULE_NAME,
        instanceUrls: INSTANCE_URLS,
        publishedPages,
        basePath: BASE_PATH,
        pathnameExists: fakePathnameExists(),
        ...overrides
    });
}

describe("validateLlmsTxtContent", () => {
    it("passes when every published page is linked and no links are broken", async () => {
        const content = [
            "# Plantstore",
            "",
            "> The plant care API.",
            "",
            "## Guides",
            "",
            "- [Get started](https://plantstore.docs.buildwithfern.com/docs/get-started)",
            "- [Watering your plant](/docs/plants/watering)",
            '- [Pruning](/docs/plants/pruning.md "Prune the plant")'
        ].join("\n");
        expect(await validate(content)).toEqual([]);
    });

    it("warns on a link to a page that does not exist", async () => {
        const content = "# Plantstore\n\n> Docs\n\n- [Fertilizing](/docs/plants/fertilizing)";
        const violations = await validate(content);
        expect(violations.some((v) => v.message.includes("does not exist"))).toBe(true);
        expect(violations.every((v) => v.severity === "warning")).toBe(true);
    });

    it("warns when published pages are missing from the file", async () => {
        const content = "# Plantstore\n\n> Docs\n\n- [Get started](/docs/get-started)";
        const violations = await validate(content);
        const coverageViolation = violations.find((v) => v.message.includes("not linked"));
        expect(coverageViolation).toBeDefined();
        expect(coverageViolation?.message).toContain("2 of 3 published pages");
        expect(coverageViolation?.message).toContain("Watering your plant");
    });

    it("does not count a broken link toward coverage", async () => {
        // The link normalizes to a real page's stripped slug, but it's broken —
        // it must not mark that page as covered.
        const content = "# Plantstore\n\n> Docs\n\n- [Watering](/plants/watering-typo)";
        const violations = await validate(content, {
            pathnameExists: async () => false
        });
        const coverageViolation = violations.find((v) => v.message.includes("not linked"));
        expect(coverageViolation?.message).toContain("3 of 3 published pages");
    });

    it("treats links written without the basePath as valid", async () => {
        const content = "# Plantstore\n\n> Docs\n\n- [Get started](/get-started)";
        const violations = await validate(content);
        expect(violations.some((v) => v.message.includes("/get-started") && v.message.includes("does not exist"))).toBe(
            false
        );
    });

    it("ignores external links, anchors, and mailto", async () => {
        const content = [
            "# Plantstore",
            "",
            "> Docs",
            "",
            "- [Get started](/docs/get-started)",
            "- [Watering your plant](/docs/plants/watering)",
            "- [Pruning](/docs/plants/pruning)",
            "- [GitHub](https://github.com/fern-api/fern)",
            "- [Email us](mailto:support@plantstore.com)",
            "- [Top](#top)"
        ].join("\n");
        expect(await validate(content)).toEqual([]);
    });

    it("accepts redirect sources as valid link targets", async () => {
        const violations = await validate("# Plantstore\n\n> Docs\n\n- [Old guide](/docs/old-guide)", {
            publishedPages: []
        });
        expect(violations).toEqual([]);
    });
});
