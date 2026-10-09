import { describe, expect, it } from "vitest";

import { addApiReference, getSpecPaths, hasFlatNavigation, renameSpecs } from "../docsYmlSpecs.js";

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

describe("addApiReference", () => {
    it("adds a new api entry when there is none", () => {
        const docsConfig = { title: "Docs", navigation: [{ page: "Welcome", path: "w.mdx" }] };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] })).toEqual({
            title: "Docs",
            navigation: [
                { page: "Welcome", path: "w.mdx" },
                { api: "API Reference", paginated: true, specs: [SPEC] }
            ]
        });
    });

    it("adds a new api entry instead of appending to an existing one", () => {
        const docsConfig = { navigation: [{ api: "API Reference", paginated: true, specs: [OTHER_SPEC] }] };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] }).navigation).toEqual([
            { api: "API Reference", paginated: true, specs: [OTHER_SPEC] },
            { api: "API Reference 2", paginated: true, specs: [SPEC] }
        ]);
    });

    it("numbers the new api entry after the ones it follows", () => {
        const docsConfig = {
            navigation: [
                { api: "API Reference", specs: [OTHER_SPEC] },
                { api: "API Reference 2", specs: [OTHER_SPEC] }
            ]
        };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] }).navigation).toEqual([
            { api: "API Reference", specs: [OTHER_SPEC] },
            { api: "API Reference 2", specs: [OTHER_SPEC] },
            { api: "API Reference 3", paginated: true, specs: [SPEC] }
        ]);
    });

    it("keeps the specless api entry of an API workspace as it is", () => {
        const docsConfig = { navigation: [{ api: "API Reference" }] };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] }).navigation).toEqual([
            { api: "API Reference" },
            { api: "API Reference 2", paginated: true, specs: [SPEC] }
        ]);
    });

    it("does not list the same spec twice", () => {
        const docsConfig = { navigation: [{ api: "API Reference", specs: [SPEC] }] };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] })).toEqual(docsConfig);
    });

    it("does not list the same spec twice when the paths are written differently", () => {
        const docsConfig = {
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "openapi.yml" }] }]
        };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] })).toEqual(docsConfig);
    });

    it("counts the api entries nested in sections when it picks the title, and adds at the end", () => {
        const docsConfig = {
            navigation: [
                { page: "Welcome", path: "w.mdx" },
                { section: "Guides", contents: [{ section: "Deeper", contents: [{ api: "API Reference" }] }] }
            ]
        };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] }).navigation).toEqual([
            { page: "Welcome", path: "w.mdx" },
            { section: "Guides", contents: [{ section: "Deeper", contents: [{ api: "API Reference" }] }] },
            { api: "API Reference 2", paginated: true, specs: [SPEC] }
        ]);
    });

    it("does not list a spec again that an api entry nested in a section lists", () => {
        const docsConfig = {
            navigation: [{ section: "Guides", contents: [{ api: "API Reference", specs: [SPEC] }] }]
        };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] })).toEqual(docsConfig);
    });

    it("fills a gap in the numbering of the api entries", () => {
        const docsConfig = {
            navigation: [
                { api: "API Reference", specs: [OTHER_SPEC] },
                { api: "API Reference 3", specs: [OTHER_SPEC] }
            ]
        };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml"] }).navigation).toContainEqual({
            api: "API Reference 2",
            paginated: true,
            specs: [SPEC]
        });
    });

    it("puts all the specs of one API on one api entry", () => {
        const docsConfig = { navigation: [] };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml", "./other.yml"] }).navigation).toEqual([
            { api: "API Reference", paginated: true, specs: [SPEC, OTHER_SPEC] }
        ]);
    });

    it("does not add an API again when any of its specs is already listed", () => {
        const docsConfig = { navigation: [{ api: "API Reference", specs: [OTHER_SPEC] }] };

        expect(addApiReference({ docsConfig, specPaths: ["./openapi.yml", "./other.yml"] })).toEqual(docsConfig);
    });

    it("adds an api entry without specs for an API the docs read from its workspace", () => {
        const docsConfig = { navigation: [] };

        expect(addApiReference({ docsConfig, specPaths: [] }).navigation).toEqual([
            { api: "API Reference", paginated: true }
        ]);
    });

    it("leaves the given docs.yml untouched", () => {
        const docsConfig = { navigation: [{ api: "API Reference", specs: [OTHER_SPEC] }] };

        addApiReference({ docsConfig, specPaths: ["./openapi.yml"] });

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
