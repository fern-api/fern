import type { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";
import { findTabSlugPrefix } from "../utils/navigationSlugPrefix";

const DOCS_DIR = "/repo/docs/fern";
const OUTPUT_DIR = "/repo/docs/code-reference/generated";

function find(docsConfig: Pick<docsYml.RawSchemas.DocsConfiguration, "navigation" | "tabs">) {
    return findTabSlugPrefix({ docsConfig, docsDirectoryPath: DOCS_DIR, outputDir: OUTPUT_DIR });
}

const generatedPage = { page: "prismo", path: "../code-reference/generated/prismo/prismo/index.mdx" };

describe("findTabSlugPrefix", () => {
    it("returns the default tab slug (kebab-cased display name) for pages listed in a section", () => {
        expect(
            find({
                tabs: { docs: { displayName: "Documentation", slug: "/" }, api: { displayName: "API Reference" } },
                navigation: [
                    { tab: "docs", layout: [{ page: "Welcome", path: "pages/welcome.mdx" }] },
                    { tab: "api", layout: [{ section: "Python API Reference", contents: [generatedPage] }] }
                ]
            })
        ).toEqual({ slugPrefix: "api-reference" });
    });

    it("uses an explicit tab slug and includes the tab variant slug", () => {
        expect(
            find({
                tabs: { api: { displayName: "API", slug: "reference" } },
                navigation: [{ tab: "api", variants: [{ title: "Python SDK", layout: [generatedPage] }] }]
            })
        ).toEqual({ slugPrefix: "reference/python-sdk" });
    });

    it("matches a folder entry that contains the output directory", () => {
        expect(
            find({
                tabs: { api: { displayName: "API Reference" } },
                navigation: [{ tab: "api", layout: [{ folder: "../code-reference" }] }]
            })
        ).toEqual({ slugPrefix: "api-reference" });
    });

    it("returns no prefix for skip-slug tabs, untabbed navigation, or unlisted pages", () => {
        expect(
            find({
                tabs: { api: { displayName: "API Reference", skipSlug: true } },
                navigation: [{ tab: "api", layout: [generatedPage] }]
            })
        ).toEqual({ slugPrefix: undefined });
        expect(find({ navigation: [generatedPage] })).toEqual({ slugPrefix: undefined });
        expect(
            find({
                tabs: { api: { displayName: "API Reference" } },
                navigation: [{ tab: "api", layout: [{ page: "Other", path: "pages/other.mdx" }] }]
            })
        ).toEqual({ slugPrefix: undefined });
    });

    it("reports conflicting prefixes when pages are listed under tabs with different slugs", () => {
        expect(
            find({
                tabs: { a: { displayName: "A" }, b: { displayName: "B" } },
                navigation: [
                    { tab: "a", layout: [generatedPage] },
                    { tab: "b", layout: [generatedPage] }
                ]
            })
        ).toEqual({ slugPrefix: undefined, conflictingPrefixes: ["a", "b"] });
    });
});
