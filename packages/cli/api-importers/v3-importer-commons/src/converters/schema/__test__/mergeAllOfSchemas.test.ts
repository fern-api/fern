import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { mergeAllOfSchemas } from "../mergeAllOfSchemas.js";

type Schema = OpenAPIV3_1.SchemaObject;

describe("mergeAllOfSchemas", () => {
    describe("properties", () => {
        it("unions property keys from multiple schemas", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                { properties: { a: { type: "string" } } } as Schema,
                { properties: { b: { type: "number" } } } as Schema
            ]);
            expect(result.properties).toEqual({
                a: { type: "string" },
                b: { type: "number" }
            });
        });

        it("deep-merges same-named object properties (Case 6: metadata)", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    properties: {
                        metadata: {
                            type: "object",
                            properties: { region: { type: "string" }, tier: { type: "string" } }
                        }
                    }
                } as Schema,
                {
                    properties: {
                        metadata: {
                            type: "object",
                            properties: { region: { type: "string" }, domain: { type: "string" } }
                        }
                    }
                } as Schema
            ]);
            const metadata = result.properties?.["metadata"] as Schema;
            expect(Object.keys(metadata.properties ?? {})).toEqual(
                expect.arrayContaining(["region", "tier", "domain"])
            );
        });
    });

    describe("required", () => {
        it("set-unions required arrays", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                { required: ["a", "b"] } as Schema,
                { required: ["b", "c"] } as Schema
            ]);
            expect(result.required).toEqual(expect.arrayContaining(["a", "b", "c"]));
            expect(result.required).toHaveLength(3);
        });
    });

    describe("items narrowing", () => {
        it("merges empty items with typed items (Case 1)", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    type: "object",
                    properties: { results: { type: "array", items: {} } }
                } as Schema,
                {
                    properties: { results: { items: { $ref: "#/components/schemas/RuleType" } } }
                } as Schema
            ]);
            const results = result.properties?.["results"] as Schema;
            expect(results.type).toBe("array");
            expect((results as OpenAPIV3_1.ArraySchemaObject).items).toEqual({
                $ref: "#/components/schemas/RuleType"
            });
        });
    });

    describe("outer schema precedence", () => {
        it("outer description wins over child description", () => {
            const result = mergeAllOfSchemas({ description: "Outer wins", allOf: [] } as Schema, [
                { description: "From child" } as Schema
            ]);
            expect(result.description).toBe("Outer wins");
        });

        it("child description used when outer has none", () => {
            const result = mergeAllOfSchemas({ allOf: [] } as Schema, [{ description: "From child" } as Schema]);
            expect(result.description).toBe("From child");
        });

        it("outer type wins over child type", () => {
            const result = mergeAllOfSchemas({ type: "object", allOf: [] } as Schema, [{ type: "string" } as Schema]);
            expect(result.type).toBe("object");
        });
    });

    describe("OR keys", () => {
        it("deprecated is true if any child says true", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                { deprecated: false } as Schema,
                { deprecated: true } as Schema
            ]);
            expect(result.deprecated).toBe(true);
        });

        it("readOnly is true if any child says true", () => {
            const result = mergeAllOfSchemas({} as Schema, [{} as Schema, { readOnly: true } as Schema]);
            expect(result.readOnly).toBe(true);
        });
    });

    describe("constraint merging", () => {
        it("takes the larger minimum (most restrictive)", () => {
            const result = mergeAllOfSchemas({} as Schema, [{ minimum: 5 } as Schema, { minimum: 10 } as Schema]);
            expect(result.minimum).toBe(10);
        });

        it("takes the smaller maximum (most restrictive)", () => {
            const result = mergeAllOfSchemas({} as Schema, [{ maxLength: 100 } as Schema, { maxLength: 50 } as Schema]);
            expect(result.maxLength).toBe(50);
        });
    });

    describe("nested allOf flattening", () => {
        it("extracts nested allOf items and merges sibling keys", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    required: ["id"],
                    properties: { id: { type: "string" } },
                    allOf: [{ required: ["name"], properties: { name: { type: "string" } } }]
                } as Schema
            ]);
            expect(result.required).toEqual(expect.arrayContaining(["id", "name"]));
            expect(result.properties?.["id"]).toBeDefined();
            expect(result.properties?.["name"]).toBeDefined();
        });

        it("does not include allOf key on the result", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    properties: { a: { type: "string" } },
                    allOf: [{ properties: { b: { type: "number" } } }]
                } as Schema
            ]);
            expect(result.allOf).toBeUndefined();
        });

        it("filters out $ref objects from nested allOf arrays", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    required: ["id"],
                    properties: { id: { type: "string" } },
                    allOf: [
                        { $ref: "#/components/schemas/Base" } as unknown as Schema,
                        { required: ["name"], properties: { name: { type: "string" } } }
                    ]
                } as Schema
            ]);
            // $ref should be filtered out, inline schema should be merged
            expect(result.properties?.["id"]).toBeDefined();
            expect(result.properties?.["name"]).toBeDefined();
            expect(result.required).toEqual(expect.arrayContaining(["id", "name"]));
            // No $ref key should leak onto the result
            expect("$ref" in result).toBe(false);
        });

        it("recursively flattens doubly-nested allOf", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    allOf: [
                        {
                            properties: { a: { type: "string" } },
                            allOf: [{ properties: { b: { type: "number" } } }]
                        }
                    ]
                } as Schema
            ]);
            expect(result.properties?.["a"]).toBeDefined();
            expect(result.properties?.["b"]).toBeDefined();
            expect(result.allOf).toBeUndefined();
        });
    });

    describe("composition keyword stripping", () => {
        it("strips oneOf from child schemas so it does not leak into merged result", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    properties: { id: { type: "string" } },
                    oneOf: [{ type: "string" }, { type: "integer" }]
                } as Schema
            ]);
            expect(result.properties?.["id"]).toBeDefined();
            expect(result.oneOf).toBeUndefined();
        });

        it("strips anyOf from child schemas", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                {
                    properties: { name: { type: "string" } },
                    anyOf: [{ type: "string" }, { type: "null" }]
                } as Schema
            ]);
            expect(result.properties?.["name"]).toBeDefined();
            expect(result.anyOf).toBeUndefined();
        });
    });

    describe("last-writer-wins fallback", () => {
        it("last schema's pattern wins", () => {
            const result = mergeAllOfSchemas({} as Schema, [{ pattern: "^a" } as Schema, { pattern: "^b" } as Schema]);
            expect(result.pattern).toBe("^b");
        });

        it("last schema's enum wins", () => {
            const result = mergeAllOfSchemas({} as Schema, [
                { enum: ["a", "b"] } as Schema,
                { enum: ["c", "d"] } as Schema
            ]);
            expect(result.enum).toEqual(["c", "d"]);
        });
    });
});
