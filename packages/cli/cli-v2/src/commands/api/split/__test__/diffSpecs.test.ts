import { applyOpenAPIOverlay } from "@fern-api/core-utils";
import { describe, expect, it } from "vitest";
import { diffObjects, generateOverlay, generateOverrides, toOverlay } from "../diffSpecs.js";

describe("diffObjects", () => {
    it("returns undefined when values are identical", () => {
        expect(diffObjects("a", "a")).toBeUndefined();
        expect(diffObjects(1, 1)).toBeUndefined();
        expect(diffObjects({ a: 1 }, { a: 1 })).toBeUndefined();
    });

    it("returns modified value for changed primitives", () => {
        expect(diffObjects("a", "b")).toBe("b");
        expect(diffObjects(1, 2)).toBe(2);
        expect(diffObjects(true, false)).toBe(false);
    });

    it("returns modified when original is undefined", () => {
        expect(diffObjects(undefined, "new")).toBe("new");
        expect(diffObjects(undefined, { a: 1 })).toEqual({ a: 1 });
    });

    it("returns modified when original is null", () => {
        expect(diffObjects(null, "new")).toBe("new");
        expect(diffObjects(null, { a: 1 })).toEqual({ a: 1 });
    });

    it("returns undefined when modified is undefined", () => {
        expect(diffObjects("a", undefined)).toBeUndefined();
    });

    it("diffs nested objects and returns only changes", () => {
        const original = { a: 1, b: 2, c: { d: 3, e: 4 } };
        const modified = { a: 1, b: 5, c: { d: 3, e: 6 } };
        expect(diffObjects(original, modified)).toEqual({ b: 5, c: { e: 6 } });
    });

    it("includes added keys", () => {
        const original = { a: 1 };
        const modified = { a: 1, b: 2 };
        expect(diffObjects(original, modified)).toEqual({ b: 2 });
    });

    it("does not include deleted keys", () => {
        const original = { a: 1, b: 2 };
        const modified = { a: 1 };
        expect(diffObjects(original, modified)).toBeUndefined();
    });

    it("treats primitive arrays as whole replacements", () => {
        const original = { tags: ["a", "b"] };
        const modified = { tags: ["a", "c"] };
        expect(diffObjects(original, modified)).toEqual({ tags: ["a", "c"] });
    });

    it("returns undefined for identical arrays", () => {
        expect(diffObjects([1, 2], [1, 2])).toBeUndefined();
    });

    it("produces sparse diff for arrays of objects", () => {
        const original = [
            { name: "id", in: "path" },
            { name: "limit", in: "query" }
        ];
        const modified = [
            { name: "id", in: "path" },
            { name: "limit", in: "query", required: true }
        ];
        expect(diffObjects(original, modified)).toEqual([{}, { required: true }]);
    });

    it("includes appended elements in sparse array diff", () => {
        const original = [{ name: "id" }];
        const modified = [{ name: "id" }, { name: "limit", in: "query" }];
        expect(diffObjects(original, modified)).toEqual([{}, { name: "limit", in: "query" }]);
    });

    it("falls back to whole replacement when object array shrinks", () => {
        const original = [{ a: 1 }, { b: 2 }, { c: 3 }];
        const modified = [{ a: 1 }, { b: 2 }];
        expect(diffObjects(original, modified)).toEqual([{ a: 1 }, { b: 2 }]);
    });

    it("returns undefined for identical arrays of objects", () => {
        const arr = [{ a: 1 }, { b: 2 }];
        expect(diffObjects(arr, arr)).toBeUndefined();
    });

    it("falls back to whole replacement for mixed arrays", () => {
        const original = [{ a: 1 }, "primitive"];
        const modified = [{ a: 1 }, "changed"];
        expect(diffObjects(original, modified)).toEqual([{ a: 1 }, "changed"]);
    });

    it("handles type change from primitive to object", () => {
        expect(diffObjects("old", { nested: true })).toEqual({ nested: true });
    });

    it("handles type change from object to primitive", () => {
        expect(diffObjects({ nested: true }, "new")).toBe("new");
    });

    it("handles type change from array to object", () => {
        expect(diffObjects([1, 2], { a: 1 })).toEqual({ a: 1 });
    });

    it("handles deeply nested additions", () => {
        const original = { paths: { "/users": { get: { summary: "List" } } } };
        const modified = {
            paths: { "/users": { get: { summary: "List", description: "List all users" } } }
        };
        expect(diffObjects(original, modified)).toEqual({
            paths: { "/users": { get: { description: "List all users" } } }
        });
    });
});

describe("generateOverrides", () => {
    it("returns empty object for identical specs", () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0" },
            paths: {}
        };
        expect(generateOverrides(spec, spec)).toEqual({});
    });

    it("captures added paths", () => {
        const original = {
            openapi: "3.0.0",
            paths: { "/users": { get: { summary: "List users" } } }
        };
        const modified = {
            openapi: "3.0.0",
            paths: {
                "/users": { get: { summary: "List users" } },
                "/pets": { get: { summary: "List pets" } }
            }
        };
        const result = generateOverrides(original, modified);
        expect(result).toEqual({
            paths: { "/pets": { get: { summary: "List pets" } } }
        });
    });

    it("captures modified properties", () => {
        const original = {
            openapi: "3.0.0",
            info: { title: "Old Title", version: "1.0" }
        };
        const modified = {
            openapi: "3.0.0",
            info: { title: "New Title", version: "1.0" }
        };
        const result = generateOverrides(original, modified);
        expect(result).toEqual({
            info: { title: "New Title" }
        });
    });

    it("captures added x-fern extensions", () => {
        const original = {
            paths: {
                "/users": {
                    get: { operationId: "listUsers" }
                }
            }
        };
        const modified = {
            paths: {
                "/users": {
                    get: {
                        operationId: "listUsers",
                        "x-fern-sdk-group-name": "users",
                        "x-fern-sdk-method-name": "list"
                    }
                }
            }
        };
        const result = generateOverrides(original, modified);
        expect(result).toEqual({
            paths: {
                "/users": {
                    get: {
                        "x-fern-sdk-group-name": "users",
                        "x-fern-sdk-method-name": "list"
                    }
                }
            }
        });
    });

    it("does not include deleted top-level sections", () => {
        const original = {
            openapi: "3.0.0",
            info: { title: "Test" },
            tags: [{ name: "users" }]
        };
        const modified = {
            openapi: "3.0.0",
            info: { title: "Test" }
        };
        expect(generateOverrides(original, modified)).toEqual({});
    });

    it("captures new top-level sections", () => {
        const original = { openapi: "3.0.0" };
        const modified = {
            openapi: "3.0.0",
            servers: [{ url: "https://api.example.com" }]
        };
        const result = generateOverrides(original, modified);
        expect(result).toEqual({
            servers: [{ url: "https://api.example.com" }]
        });
    });

    it("handles component schema changes", () => {
        const original = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: { type: "string" }
                        }
                    }
                }
            }
        };
        const modified = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" }
                        }
                    }
                }
            }
        };
        const result = generateOverrides(original, modified);
        expect(result).toEqual({
            components: {
                schemas: {
                    User: {
                        properties: {
                            email: { type: "string" }
                        }
                    }
                }
            }
        });
    });

    it("handles changed top-level primitive", () => {
        const original = { openapi: "3.0.0" };
        const modified = { openapi: "3.1.0" };
        const result = generateOverrides(original, modified);
        expect(result).toEqual({ openapi: "3.1.0" });
    });
});

describe("generateOverlay", () => {
    it("returns empty actions for identical specs", () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0" },
            paths: {}
        };
        const result = generateOverlay(spec, spec);
        expect(result.overlay).toBe("1.0.0");
        expect(result.actions).toHaveLength(0);
    });

    it("generates action for added x-fern extensions", () => {
        const original = {
            paths: {
                "/users": {
                    get: { operationId: "listUsers" }
                }
            }
        };
        const modified = {
            paths: {
                "/users": {
                    get: {
                        operationId: "listUsers",
                        "x-fern-sdk-group-name": "users",
                        "x-fern-sdk-method-name": "list"
                    }
                }
            }
        };
        const result = generateOverlay(original, modified);
        expect(result.actions.length).toBeGreaterThan(0);

        // Applying the overlay to the original should produce the modified spec
        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(result) });
        expect(applied).toEqual(modified);
    });

    it("generates action for added properties in components", () => {
        const original = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: { type: "string" }
                        }
                    }
                }
            }
        };
        const modified = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" }
                        }
                    }
                }
            }
        };
        const result = generateOverlay(original, modified);
        expect(result.actions.length).toBeGreaterThan(0);

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(result) });
        expect(applied).toEqual(modified);
    });

    it("generates action for new top-level sections", () => {
        const original = { openapi: "3.0.0" };
        const modified = {
            openapi: "3.0.0",
            servers: [{ url: "https://api.example.com" }]
        };
        const result = generateOverlay(original, modified);
        expect(result.actions.length).toBeGreaterThan(0);

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(result) });
        expect(applied).toEqual(modified);
    });

    it("generates action for changed scalar values", () => {
        const original = { openapi: "3.0.0", info: { title: "Old", version: "1.0" } };
        const modified = { openapi: "3.0.0", info: { title: "New", version: "1.0" } };
        const result = generateOverlay(original, modified);
        expect(result.actions.length).toBeGreaterThan(0);

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(result) });
        expect(applied).toEqual(modified);
    });

    it("uses bracket notation for special keys in JSONPath", () => {
        const original = {
            paths: {
                "/users/{id}": {
                    get: { operationId: "getUser" }
                }
            }
        };
        const modified = {
            paths: {
                "/users/{id}": {
                    get: { operationId: "getUser", "x-fern-group": "users" }
                }
            }
        };
        const result = generateOverlay(original, modified);
        // Should use bracket notation for path keys with special chars
        const targets = result.actions.map((a) => a.target);
        expect(targets.some((t) => t.includes("['/users/{id}']"))).toBe(true);

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(result) });
        expect(applied).toEqual(modified);
    });

    it("has correct overlay document structure", () => {
        const result = generateOverlay({ openapi: "3.0.0" }, { openapi: "3.1.0" });
        expect(result.overlay).toBe("1.0.0");
        expect(result.info).toEqual({ title: "Fern Overlay", version: "0.0.0" });
        expect(Array.isArray(result.actions)).toBe(true);
    });

    it("round-trips: applying overlay to original produces modified spec", () => {
        // biome-ignore lint/suspicious/noExplicitAny: test data
        const original: Record<string, any> = {
            openapi: "3.0.0",
            info: { title: "Pet Store", version: "1.0.0" },
            paths: {
                "/pets": {
                    get: {
                        operationId: "listPets",
                        summary: "List all pets",
                        responses: { "200": { description: "A list of pets" } }
                    },
                    post: {
                        operationId: "createPet",
                        summary: "Create a pet"
                    }
                },
                "/pets/{petId}": {
                    get: {
                        operationId: "getPet",
                        summary: "Get a pet by ID"
                    }
                }
            },
            components: {
                schemas: {
                    Pet: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            name: { type: "string" }
                        }
                    }
                }
            }
        };
        const modified = structuredClone(original);
        modified.paths["/pets"].get["x-fern-sdk-group-name"] = "pets";
        modified.paths["/pets"].get["x-fern-sdk-method-name"] = "list";
        modified.paths["/pets"].post["x-fern-sdk-group-name"] = "pets";
        modified.paths["/pets/{petId}"].get["x-fern-sdk-group-name"] = "pets";
        modified.components.schemas.Pet.properties.breed = { type: "string" };

        const overlay = generateOverlay(original, modified);
        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });

    it("handles adding entirely new paths", () => {
        const original = {
            paths: {
                "/pets": { get: { operationId: "listPets" } }
            }
        };
        const modified = {
            paths: {
                "/pets": { get: { operationId: "listPets" } },
                "/owners": { get: { operationId: "listOwners" } }
            }
        };
        const overlay = generateOverlay(original, modified);
        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });

    it("targets array elements by index instead of sparse padding", () => {
        // biome-ignore lint/suspicious/noExplicitAny: test data
        const original: Record<string, any> = {
            paths: {
                "/creds": {
                    get: {
                        parameters: [
                            { name: "id", in: "path" },
                            { name: "limit", in: "query", schema: { type: "integer" } },
                            { name: "offset", in: "query" },
                            { name: "sort", in: "query" },
                            { name: "filter", in: "query" },
                            { name: "fields", in: "query" },
                            { name: "page", in: "query" },
                            { name: "size", in: "query" }
                        ]
                    }
                }
            }
        };
        const modified = structuredClone(original);
        modified.paths["/creds"].get.parameters[1].schema.default = 500;

        const overlay = generateOverlay(original, modified);

        // Should NOT produce sparse arrays with empty objects
        const hasEmptyObjectPadding = overlay.actions.some(
            (a) =>
                Array.isArray(a.update) &&
                (a.update as unknown[]).some(
                    (el) =>
                        typeof el === "object" && el !== null && Object.keys(el as Record<string, unknown>).length === 0
                )
        );
        expect(hasEmptyObjectPadding).toBe(false);

        // Should use indexed JSONPath like $.paths['/creds'].get.parameters[1]
        const targets = overlay.actions.map((a) => a.target);
        expect(targets.some((t) => t.includes("parameters[1]"))).toBe(true);

        // Round-trip should produce the modified spec
        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });

    it("emits remove actions for deleted object keys", () => {
        const original = {
            info: { title: "API", version: "1.0", description: "My API" }
        };
        const modified = {
            info: { title: "API", version: "1.0" }
        };

        const overlay = generateOverlay(original, modified);
        const removeActions = overlay.actions.filter((a) => a.remove === true);
        expect(removeActions.length).toBe(1);
        expect(removeActions[0]?.target).toBe("$.info.description");

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });

    it("emits remove actions for deleted array elements", () => {
        const original = {
            tags: [
                { name: "pets", description: "Pet operations" },
                { name: "owners", description: "Owner operations" },
                { name: "admin", description: "Admin operations" }
            ]
        };
        const modified = {
            tags: [
                { name: "pets", description: "Pet operations" },
                { name: "owners", description: "Owner operations" }
            ]
        };

        const overlay = generateOverlay(original, modified);
        const removeActions = overlay.actions.filter((a) => a.remove === true);
        expect(removeActions.length).toBe(1);
        expect(removeActions[0]?.target).toBe("$.tags[2]");

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });

    it("handles appended array elements via array-level targeting", () => {
        const original = {
            tags: [{ name: "pets" }]
        };
        const modified = {
            tags: [{ name: "pets" }, { name: "owners" }, { name: "admin" }]
        };

        const overlay = generateOverlay(original, modified);
        // Appended elements should target the array itself (overlay append semantics)
        const appendActions = overlay.actions.filter((a) => a.target === "$.tags" && a.remove !== true);
        expect(appendActions.length).toBe(2);

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });

    it("produces clean output without remove:false or empty descriptions", () => {
        const original = { openapi: "3.0.0", info: { title: "Old" } };
        const modified = { openapi: "3.0.0", info: { title: "New" } };

        const overlay = generateOverlay(original, modified);
        for (const action of overlay.actions) {
            // Update actions should not have remove field
            if (action.update !== undefined) {
                expect(action.remove).toBeUndefined();
            }
            // No actions should have empty string description
            expect(action.description).toBeUndefined();
        }
    });

    it("handles multiple removed array elements in correct order", () => {
        const original = {
            servers: [
                { url: "https://a.example.com" },
                { url: "https://b.example.com" },
                { url: "https://c.example.com" },
                { url: "https://d.example.com" }
            ]
        };
        const modified = {
            servers: [{ url: "https://a.example.com" }, { url: "https://b.example.com" }]
        };

        const overlay = generateOverlay(original, modified);
        const removeActions = overlay.actions.filter((a) => a.remove === true);
        // Should remove in reverse order (index 3 before index 2)
        expect(removeActions.length).toBe(2);
        expect(removeActions[0]?.target).toBe("$.servers[3]");
        expect(removeActions[1]?.target).toBe("$.servers[2]");

        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });

    it("handles simultaneous additions, modifications, and deletions in arrays", () => {
        const original = {
            tags: [
                { name: "pets", description: "Pet ops" },
                { name: "owners", description: "Owner ops" },
                { name: "deprecated", description: "Old stuff" }
            ]
        };
        const modified = {
            tags: [
                { name: "pets", description: "Pet operations" },
                { name: "owners", description: "Owner ops" }
            ]
        };

        const overlay = generateOverlay(original, modified);
        const applied = applyOpenAPIOverlay({ data: original, overlay: toOverlay(overlay) });
        expect(applied).toEqual(modified);
    });
});
