import { describe, expect, it } from "vitest";

import { getDocsApiSectionsWithInlineSpecs } from "../inline-specs.js";

const SPEC = { type: "openapi", path: "openapi/openapi.yml" };

function apiSection(name: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
    return { api: name, specs: [SPEC], ...extra };
}

function apiNames(navigation: unknown): string[] {
    return getDocsApiSectionsWithInlineSpecs(navigation).map((section) => section.api);
}

describe("getDocsApiSectionsWithInlineSpecs", () => {
    describe("inputs that are not navigation containers", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["a string", "api"],
            ["a number", 42],
            ["a boolean", true],
            ["an empty array", []],
            ["an empty object", {}]
        ])("returns [] for %s", (_name, navigation) => {
            expect(getDocsApiSectionsWithInlineSpecs(navigation)).toEqual([]);
        });

        it("skips primitives and null nested inside arrays", () => {
            expect(getDocsApiSectionsWithInlineSpecs([undefined, null, "x", 1, apiSection("A")])).toEqual([
                apiSection("A")
            ]);
        });
    });

    describe("what counts as an api section with inline specs", () => {
        it("matches an api item with non-empty specs and returns the very same object", () => {
            const section = apiSection("A");
            const result = getDocsApiSectionsWithInlineSpecs([section]);
            expect(result).toHaveLength(1);
            expect(result[0]).toBe(section);
        });

        it("matches a bare (non-array) api object", () => {
            expect(apiNames(apiSection("A"))).toEqual(["A"]);
        });

        it.each([
            ["an empty specs array", { api: "A", specs: [] }],
            ["no specs key", { api: "A" }],
            ["specs: null", { api: "A", specs: null }],
            ["specs that is an object, not an array", { api: "A", specs: SPEC }],
            ["specs that is a string", { api: "A", specs: "openapi.yml" }],
            ["a non-string api (true)", { api: true, specs: [SPEC] }],
            ["a non-string api (number)", { api: 1, specs: [SPEC] }],
            ["a null api", { api: null, specs: [SPEC] }],
            ["an object api", { api: { name: "A" }, specs: [SPEC] }],
            ["no api key", { specs: [SPEC] }]
        ])("does not match %s", (_name, item) => {
            expect(getDocsApiSectionsWithInlineSpecs([item])).toEqual([]);
        });

        // Odd but current behavior: only the array length is checked, not the shape of its entries.
        it("matches when specs holds non-spec entries", () => {
            expect(apiNames([{ api: "A", specs: [null] }])).toEqual(["A"]);
        });

        // Odd but current behavior: an empty-string api title still counts as a string.
        it("matches an empty-string api title", () => {
            expect(apiNames([{ api: "", specs: [SPEC] }])).toEqual([""]);
        });

        it("keeps all other properties on the matched item", () => {
            const section = apiSection("A", { "api-name": "a", layout: [{ page: "x" }], hidden: true });
            expect(getDocsApiSectionsWithInlineSpecs([section])).toEqual([section]);
        });
    });

    describe("traversal", () => {
        it("returns matches in document order across a flat array", () => {
            expect(
                apiNames([apiSection("A"), { page: "Intro", path: "intro.mdx" }, apiSection("B"), apiSection("C")])
            ).toEqual(["A", "B", "C"]);
        });

        it("descends into sections", () => {
            expect(
                apiNames([{ section: "S", contents: [apiSection("A"), { section: "T", contents: [apiSection("B")] }] }])
            ).toEqual(["A", "B"]);
        });

        it.each([
            ["tab layouts", [{ tab: "t", layout: [apiSection("A")] }]],
            ["a tabs-less layout key", { layout: [apiSection("A")] }],
            ["products", [{ product: "p", path: "p.yml", navigation: [apiSection("A")] }]],
            ["versions", [{ version: "v1", path: "v1.yml", navigation: [apiSection("A")] }]],
            [
                "versions inside products",
                [{ product: "p", versions: [{ version: "v1", navigation: [apiSection("A")] }] }]
            ],
            [
                "tabs inside versions inside products",
                {
                    products: [
                        {
                            product: "p",
                            versions: [{ version: "v1", navigation: [{ tab: "t", layout: [apiSection("A")] }] }]
                        }
                    ]
                }
            ]
        ])("finds an api section nested in %s", (_name, navigation) => {
            expect(apiNames(navigation)).toEqual(["A"]);
        });

        it("finds sections nested deeply under arbitrary keys", () => {
            let navigation: unknown = apiSection("Deep");
            for (let depth = 0; depth < 50; depth++) {
                navigation = depth % 2 === 0 ? { wrapper: navigation } : [navigation];
            }
            expect(apiNames(navigation)).toEqual(["Deep"]);
        });

        it("returns matches from several branches, in key then array order", () => {
            expect(
                apiNames({
                    navigation: [apiSection("A")],
                    tabs: { first: { layout: [apiSection("B")] }, second: [[apiSection("C")]] },
                    versions: [{ navigation: [apiSection("D")] }]
                })
            ).toEqual(["A", "B", "C", "D"]);
        });

        it("traverses every value of a non-matching api item, including api items without specs", () => {
            expect(
                apiNames([
                    { api: "Outer", specs: [], layout: [apiSection("Inner")] },
                    { api: "NoSpecs", more: apiSection("X") }
                ])
            ).toEqual(["Inner", "X"]);
        });

        it("traverses an object that has specs but no api", () => {
            expect(apiNames([{ specs: [SPEC], layout: [apiSection("Inner")] }])).toEqual(["Inner"]);
        });

        it("does not descend into a matched item", () => {
            const nested = apiSection("Nested");
            const outer = apiSection("Outer", { layout: [nested], contents: [nested] });
            const result = getDocsApiSectionsWithInlineSpecs([outer, apiSection("Sibling")]);
            expect(result.map((section) => section.api)).toEqual(["Outer", "Sibling"]);
            expect(result[0]).toBe(outer);
        });

        it("returns a matched item once per reference when it is referenced from two places", () => {
            const shared = apiSection("Shared");
            expect(apiNames([shared, { section: "S", contents: [shared] }])).toEqual(["Shared", "Shared"]);
        });
    });

    describe("does not mutate its input", () => {
        it("leaves the navigation untouched", () => {
            const navigation = [
                { tab: "t", layout: [apiSection("A")] },
                { api: "B", specs: [] }
            ];
            const snapshot = structuredClone(navigation);
            getDocsApiSectionsWithInlineSpecs(navigation);
            expect(navigation).toEqual(snapshot);
        });
    });
});
