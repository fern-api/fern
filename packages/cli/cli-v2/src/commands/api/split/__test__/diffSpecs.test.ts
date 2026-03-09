import { describe, expect, it } from "vitest";
import { diffObjects, generateOverrides } from "../diffSpecs.js";

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
