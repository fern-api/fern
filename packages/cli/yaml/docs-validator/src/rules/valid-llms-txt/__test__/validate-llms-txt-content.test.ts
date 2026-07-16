import { describe, expect, it } from "vitest";

import { extractMarkdownLinks } from "../extract-markdown-links.js";
import { normalizeToSlug, PublishedPage, validateLlmsTxtContent } from "../validate-llms-txt-content.js";

const RULE_NAME = "valid-llms-txt";

const publishedPages: PublishedPage[] = [
    { pageId: "get-started.mdx", title: "Get started", slugs: ["docs/get-started"] },
    { pageId: "plants/watering.mdx", title: "Watering your plant", slugs: ["docs/plants/watering"] },
    { pageId: "plants/pruning.mdx", title: "Pruning", slugs: ["docs/plants/pruning"] }
];

const visitableSlugs = new Set(["docs/get-started", "docs/plants/watering", "docs/plants/pruning"]);

function validate(content: string): ReturnType<typeof validateLlmsTxtContent> {
    return validateLlmsTxtContent({
        content,
        fileLabel: "llms.txt",
        ruleName: RULE_NAME,
        publishedPages,
        visitableSlugs,
        basePath: "docs",
        instanceHosts: ["plantstore.docs.buildwithfern.com"],
        redirectSources: []
    });
}

describe("extractMarkdownLinks", () => {
    it("extracts links and ignores titles", () => {
        const links = extractMarkdownLinks(
            '# Plantstore\n\n> Docs\n\n## Guides\n\n- [Get started](https://x.com/docs/get-started): intro\n- [Watering](/docs/plants/watering "Water the plant")'
        );
        expect(links).toEqual([
            { text: "Get started", url: "https://x.com/docs/get-started" },
            { text: "Watering", url: "/docs/plants/watering" }
        ]);
    });
});

describe("normalizeToSlug", () => {
    it("strips host, anchors, query, trailing slash, and .md suffix", () => {
        expect(normalizeToSlug("https://plantstore.docs.buildwithfern.com/docs/get-started.md")).toBe(
            "docs/get-started"
        );
        expect(normalizeToSlug("/docs/plants/watering/#section?x=1")).toBe("docs/plants/watering");
    });
});

describe("validateLlmsTxtContent", () => {
    it("passes when every published page is linked and no links are broken", () => {
        const content = [
            "# Plantstore",
            "",
            "> The plant care API.",
            "",
            "## Guides",
            "",
            "- [Get started](https://plantstore.docs.buildwithfern.com/docs/get-started)",
            "- [Watering your plant](/docs/plants/watering)",
            "- [Pruning](/docs/plants/pruning.md)"
        ].join("\n");
        expect(validate(content)).toEqual([]);
    });

    it("warns on a link to a page that does not exist", () => {
        const content = "# Plantstore\n\n> Docs\n\n- [Fertilizing](/docs/plants/fertilizing)";
        const violations = validate(content);
        expect(violations.some((v) => v.message.includes("does not exist"))).toBe(true);
        expect(violations.every((v) => v.severity === "warning")).toBe(true);
    });

    it("warns when published pages are missing from the file", () => {
        const content = "# Plantstore\n\n> Docs\n\n- [Get started](/docs/get-started)";
        const violations = validate(content);
        const coverageViolation = violations.find((v) => v.message.includes("not linked"));
        expect(coverageViolation).toBeDefined();
        expect(coverageViolation?.message).toContain("2 of 3 published pages");
        expect(coverageViolation?.message).toContain("Watering your plant");
    });

    it("treats links written without the basePath as valid", () => {
        const content = "# Plantstore\n\n> Docs\n\n- [Get started](/get-started)";
        const violations = validate(content);
        expect(violations.some((v) => v.message.includes("/get-started") && v.message.includes("does not exist"))).toBe(
            false
        );
    });

    it("ignores external links, anchors, and mailto", () => {
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
        expect(validate(content)).toEqual([]);
    });

    it("accepts redirect sources as valid link targets", () => {
        const violations = validateLlmsTxtContent({
            content: "# Plantstore\n\n> Docs\n\n- [Old guide](/docs/old-guide)",
            fileLabel: "llms.txt",
            ruleName: RULE_NAME,
            publishedPages: [],
            visitableSlugs,
            basePath: "docs",
            instanceHosts: ["plantstore.docs.buildwithfern.com"],
            redirectSources: ["/docs/old-guide"]
        });
        expect(violations).toEqual([]);
    });
});
