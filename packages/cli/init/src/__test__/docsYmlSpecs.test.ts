import { describe, expect, it } from "vitest";

import { addSpec, getSpecPaths, hasFlatNavigation, renameSpecs } from "../docsYmlSpecs.js";

const SPEC = { type: "openapi", path: "./openapi.yml" };
const OTHER_SPEC = { type: "openapi", path: "./other.yml" };

describe("hasFlatNavigation", () => {
    it("accepts a list of pages and api entries", () => {
        expect(hasFlatNavigation({ navigation: [{ page: "Welcome", path: "w.mdx" }, { api: "API Reference" }] })).toBe(
            true
        );
    });

    it.each([
        ["a navigation split into tabs", { navigation: [{ tab: "docs", layout: [] }] }],
        ["no navigation", { title: "Docs" }],
        ["something that is not an object", "docs"]
    ])("rejects %s", (_, docsConfig) => {
        expect(hasFlatNavigation(docsConfig)).toBe(false);
    });
});

describe("addSpec", () => {
    it("adds a new api entry when there is none", () => {
        const docsConfig = { title: "Docs", navigation: [{ page: "Welcome", path: "w.mdx" }] };

        expect(addSpec({ docsConfig, specPath: "./openapi.yml" })).toEqual({
            title: "Docs",
            navigation: [
                { page: "Welcome", path: "w.mdx" },
                { api: "API Reference", paginated: true, specs: [SPEC] }
            ]
        });
    });

    it("appends to the specs of the first api entry only", () => {
        const docsConfig = {
            navigation: [
                { api: "First", specs: [OTHER_SPEC] },
                { api: "Second", specs: [OTHER_SPEC] }
            ]
        };

        expect(addSpec({ docsConfig, specPath: "./openapi.yml" }).navigation).toEqual([
            { api: "First", specs: [OTHER_SPEC, SPEC] },
            { api: "Second", specs: [OTHER_SPEC] }
        ]);
    });

    it("gives an api entry built from the API workspace its first spec", () => {
        const docsConfig = { navigation: [{ api: "API Reference" }] };

        expect(addSpec({ docsConfig, specPath: "./openapi.yml" }).navigation).toEqual([
            { api: "API Reference", specs: [SPEC] }
        ]);
    });

    it("does not list the same spec twice", () => {
        const docsConfig = { navigation: [{ api: "API Reference", specs: [SPEC] }] };

        expect(addSpec({ docsConfig, specPath: "./openapi.yml" })).toEqual(docsConfig);
    });

    it("does not list the same spec twice when the paths are written differently", () => {
        const docsConfig = {
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "openapi.yml" }] }]
        };

        expect(addSpec({ docsConfig, specPath: "./openapi.yml" })).toEqual(docsConfig);
    });

    it("adds to an api entry nested in a section instead of adding a new one", () => {
        const docsConfig = {
            navigation: [
                { page: "Welcome", path: "w.mdx" },
                { section: "Guides", contents: [{ section: "Deeper", contents: [{ api: "API Reference" }] }] }
            ]
        };

        expect(addSpec({ docsConfig, specPath: "./openapi.yml" }).navigation).toEqual([
            { page: "Welcome", path: "w.mdx" },
            {
                section: "Guides",
                contents: [{ section: "Deeper", contents: [{ api: "API Reference", specs: [SPEC] }] }]
            }
        ]);
    });

    it("picks the first api entry in document order, nested or not", () => {
        const docsConfig = {
            navigation: [{ section: "Guides", contents: [{ api: "Nested" }] }, { api: "Root" }]
        };

        expect(addSpec({ docsConfig, specPath: "./openapi.yml" }).navigation).toEqual([
            { section: "Guides", contents: [{ api: "Nested", specs: [SPEC] }] },
            { api: "Root" }
        ]);
    });

    it("leaves the given docs.yml untouched", () => {
        const docsConfig = { navigation: [{ api: "API Reference", specs: [OTHER_SPEC] }] };

        addSpec({ docsConfig, specPath: "./openapi.yml" });

        expect(docsConfig).toEqual({ navigation: [{ api: "API Reference", specs: [OTHER_SPEC] }] });
    });
});

describe("renameSpecs", () => {
    const renames = new Map([["openapi.yml", "./apis/api/openapi.yml"]]);

    it("renames the specs that have a new path and keeps the others", () => {
        const docsConfig = { navigation: [{ api: "API Reference", specs: [SPEC, OTHER_SPEC] }] };

        expect(renameSpecs({ docsConfig, renames })).toEqual({
            navigation: [
                {
                    api: "API Reference",
                    specs: [{ type: "openapi", path: "./apis/api/openapi.yml" }, OTHER_SPEC]
                }
            ]
        });
    });

    it("matches a path however it is written", () => {
        const docsConfig = {
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "openapi.yml" }] }]
        };

        expect(renameSpecs({ docsConfig, renames })).toEqual({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./apis/api/openapi.yml" }] }]
        });
    });

    it("renames specs nested in sections, tabs and tab variants", () => {
        const api = { api: "API Reference", specs: [SPEC] };
        const renamedApi = { api: "API Reference", specs: [{ type: "openapi", path: "./apis/api/openapi.yml" }] };
        const docsConfig = {
            navigation: [
                { section: "Guides", contents: [api] },
                { tab: "Reference", layout: [api] },
                { tab: "Versions", variants: [{ title: "v1", layout: [api] }] }
            ]
        };

        expect(renameSpecs({ docsConfig, renames })).toEqual({
            navigation: [
                { section: "Guides", contents: [renamedApi] },
                { tab: "Reference", layout: [renamedApi] },
                { tab: "Versions", variants: [{ title: "v1", layout: [renamedApi] }] }
            ]
        });
    });

    it("returns an equal config when no spec has a new path", () => {
        const docsConfig = {
            navigation: [
                { api: "API Reference", specs: [OTHER_SPEC] },
                { page: "p", path: "p.mdx" }
            ]
        };

        expect(renameSpecs({ docsConfig, renames })).toEqual(docsConfig);
    });

    it("returns anything that is not a docs.yml as is", () => {
        expect(renameSpecs({ docsConfig: "docs", renames })).toBe("docs");
    });
});

describe("getSpecPaths", () => {
    it("lists the spec paths of every api entry, nested ones included", () => {
        const docsConfig = {
            navigation: [
                { api: "First", specs: [SPEC] },
                { section: "Guides", contents: [{ api: "Second", specs: [OTHER_SPEC] }] },
                { api: "Without specs" }
            ]
        };

        expect(getSpecPaths(docsConfig)).toEqual(["./openapi.yml", "./other.yml"]);
    });

    it("lists nothing for something that is not a docs.yml", () => {
        expect(getSpecPaths("docs")).toEqual([]);
    });
});
