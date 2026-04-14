import { describe, expect, it } from "vitest";
import { mergeAllOfSchemas } from "../mergeAllOfSchemas.js";

describe("mergeAllOfSchemas", () => {
    describe("properties", () => {
        it("unions property keys from multiple schemas", () => {
            const result = mergeAllOfSchemas({} as any, [
                { properties: { a: { type: "string" } } } as any,
                { properties: { b: { type: "number" } } } as any
            ]);
            expect(result.properties).toEqual({
                a: { type: "string" },
                b: { type: "number" }
            });
        });

        it("deep-merges same-named object properties (Case 6: metadata)", () => {
            const result = mergeAllOfSchemas({} as any, [
                {
                    properties: {
                        metadata: {
                            type: "object",
                            properties: { region: { type: "string" }, tier: { type: "string" } }
                        }
                    }
                } as any,
                {
                    properties: {
                        metadata: {
                            type: "object",
                            properties: { region: { type: "string" }, domain: { type: "string" } }
                        }
                    }
                } as any
            ]);
            const metadata = (result.properties as any).metadata;
            expect(Object.keys(metadata.properties)).toEqual(expect.arrayContaining(["region", "tier", "domain"]));
        });
    });

    describe("required", () => {
        it("set-unions required arrays", () => {
            const result = mergeAllOfSchemas({} as any, [
                { required: ["a", "b"] } as any,
                { required: ["b", "c"] } as any
            ]);
            expect(result.required).toEqual(expect.arrayContaining(["a", "b", "c"]));
            expect(result.required).toHaveLength(3);
        });
    });

    describe("items narrowing", () => {
        it("merges empty items with typed items (Case 1)", () => {
            const result = mergeAllOfSchemas({} as any, [
                {
                    type: "object",
                    properties: { results: { type: "array", items: {} } }
                } as any,
                {
                    properties: { results: { items: { $ref: "#/components/schemas/RuleType" } } }
                } as any
            ]);
            const results = (result.properties as any).results;
            expect(results.type).toBe("array");
            expect(results.items).toEqual({ $ref: "#/components/schemas/RuleType" });
        });
    });

    describe("outer schema precedence", () => {
        it("outer description wins over child description", () => {
            const result = mergeAllOfSchemas({ description: "Outer wins", allOf: [] } as any, [
                { description: "From child" } as any
            ]);
            expect(result.description).toBe("Outer wins");
        });

        it("child description used when outer has none", () => {
            const result = mergeAllOfSchemas({ allOf: [] } as any, [{ description: "From child" } as any]);
            expect(result.description).toBe("From child");
        });

        it("outer type wins over child type", () => {
            const result = mergeAllOfSchemas({ type: "object", allOf: [] } as any, [{ type: "string" } as any]);
            expect(result.type).toBe("object");
        });
    });

    describe("OR keys", () => {
        it("deprecated is true if any child says true", () => {
            const result = mergeAllOfSchemas({} as any, [{ deprecated: false } as any, { deprecated: true } as any]);
            expect(result.deprecated).toBe(true);
        });

        it("readOnly is true if any child says true", () => {
            const result = mergeAllOfSchemas({} as any, [{} as any, { readOnly: true } as any]);
            expect(result.readOnly).toBe(true);
        });
    });

    describe("constraint merging", () => {
        it("takes the larger minimum (most restrictive)", () => {
            const result = mergeAllOfSchemas({} as any, [{ minimum: 5 } as any, { minimum: 10 } as any]);
            expect(result.minimum).toBe(10);
        });

        it("takes the smaller maximum (most restrictive)", () => {
            const result = mergeAllOfSchemas({} as any, [{ maxLength: 100 } as any, { maxLength: 50 } as any]);
            expect(result.maxLength).toBe(50);
        });
    });

    describe("nested allOf flattening", () => {
        it("extracts nested allOf items and merges sibling keys", () => {
            const result = mergeAllOfSchemas({} as any, [
                {
                    required: ["id"],
                    properties: { id: { type: "string" } },
                    allOf: [{ required: ["name"], properties: { name: { type: "string" } } }]
                } as any
            ]);
            expect(result.required).toEqual(expect.arrayContaining(["id", "name"]));
            expect((result.properties as any).id).toBeDefined();
            expect((result.properties as any).name).toBeDefined();
        });

        it("does not include allOf key on the result", () => {
            const result = mergeAllOfSchemas({} as any, [
                {
                    properties: { a: { type: "string" } },
                    allOf: [{ properties: { b: { type: "number" } } }]
                } as any
            ]);
            expect(result.allOf).toBeUndefined();
        });
    });

    describe("last-writer-wins fallback", () => {
        it("last schema's pattern wins", () => {
            const result = mergeAllOfSchemas({} as any, [{ pattern: "^a" } as any, { pattern: "^b" } as any]);
            expect(result.pattern).toBe("^b");
        });

        it("last schema's enum wins", () => {
            const result = mergeAllOfSchemas({} as any, [{ enum: ["a", "b"] } as any, { enum: ["c", "d"] } as any]);
            expect(result.enum).toEqual(["c", "d"]);
        });
    });
});
