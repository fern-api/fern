import { Schema, Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";
import { parse } from "../parse.js";

function mockTaskContext(): TaskContext {
    return {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            trace: vi.fn(),
            log: vi.fn()
        }
    } as unknown as TaskContext;
}

function findRootSchema(ir: ReturnType<typeof parse>, name: string): Schema | undefined {
    return ir.groupedSchemas.rootSchemas[name];
}

function commonPropertyKeysOf(schema: Schema | undefined): string[] {
    if (schema == null || schema.type !== "oneOf") {
        return [];
    }
    if (schema.value.type !== "discriminated") {
        return [];
    }
    return schema.value.commonProperties.map((p) => p.key);
}

function commonPropertyOptionalityOf(schema: Schema | undefined, key: string): "required" | "optional" | "missing" {
    if (schema == null || schema.type !== "oneOf" || schema.value.type !== "discriminated") {
        return "missing";
    }
    const prop = schema.value.commonProperties.find((p) => p.key === key);
    if (prop == null) {
        return "missing";
    }
    return prop.schema.type === "optional" ? "optional" : "required";
}

describe("infer-discriminated-union-base-properties", () => {
    it("does NOT infer properties already inherited via a shared allOf $ref parent", () => {
        const doc: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0" },
            paths: {
                "/things": {
                    get: {
                        operationId: "listThings",
                        responses: {
                            "200": {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/MyUnion" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    Common: {
                        type: "object",
                        properties: {
                            sharedField: { type: "string" },
                            anotherShared: { type: "integer" }
                        }
                        // no `required` — both fields are optional in Common
                    },
                    VariantA: {
                        allOf: [
                            { $ref: "#/components/schemas/Common" },
                            {
                                type: "object",
                                properties: {
                                    kind: { type: "string", enum: ["a"] },
                                    ownPropA: { type: "string" }
                                },
                                required: ["kind"]
                            }
                        ]
                    },
                    VariantB: {
                        allOf: [
                            { $ref: "#/components/schemas/Common" },
                            {
                                type: "object",
                                properties: {
                                    kind: { type: "string", enum: ["b"] },
                                    ownPropB: { type: "string" }
                                },
                                required: ["kind"]
                            }
                        ]
                    },
                    MyUnion: {
                        type: "object",
                        oneOf: [{ $ref: "#/components/schemas/VariantA" }, { $ref: "#/components/schemas/VariantB" }],
                        discriminator: {
                            propertyName: "kind",
                            mapping: {
                                a: "#/components/schemas/VariantA",
                                b: "#/components/schemas/VariantB"
                            }
                        }
                    }
                }
            }
        };

        const ir = parse({
            context: mockTaskContext(),
            documents: [
                {
                    type: "openapi",
                    value: doc,
                    source: Source.openapi({ file: "test.yml" }),
                    settings: {
                        ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                        shouldInferDiscriminatedUnionBaseProperties: true
                    }
                }
            ]
        });

        const union = findRootSchema(ir, "MyUnion");
        const keys = commonPropertyKeysOf(union);

        // `sharedField` and `anotherShared` come from Common, which every variant inherits
        // via `allOf: $ref`. They should NOT be re-emitted as union commonProperties.
        expect(keys).not.toContain("sharedField");
        expect(keys).not.toContain("anotherShared");
    });

    it("still infers properties that variants declare inline (not inherited from a shared parent)", () => {
        const doc: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0" },
            paths: {
                "/things": {
                    get: {
                        operationId: "listThings",
                        responses: {
                            "200": {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/MyUnion" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    VariantA: {
                        type: "object",
                        properties: {
                            kind: { type: "string", enum: ["a"] },
                            inlineShared: { type: "string" },
                            ownPropA: { type: "string" }
                        },
                        required: ["kind", "inlineShared"]
                    },
                    VariantB: {
                        type: "object",
                        properties: {
                            kind: { type: "string", enum: ["b"] },
                            inlineShared: { type: "string" },
                            ownPropB: { type: "string" }
                        },
                        required: ["kind", "inlineShared"]
                    },
                    MyUnion: {
                        type: "object",
                        oneOf: [{ $ref: "#/components/schemas/VariantA" }, { $ref: "#/components/schemas/VariantB" }],
                        discriminator: {
                            propertyName: "kind",
                            mapping: {
                                a: "#/components/schemas/VariantA",
                                b: "#/components/schemas/VariantB"
                            }
                        }
                    }
                }
            }
        };

        const ir = parse({
            context: mockTaskContext(),
            documents: [
                {
                    type: "openapi",
                    value: doc,
                    source: Source.openapi({ file: "test.yml" }),
                    settings: {
                        ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                        shouldInferDiscriminatedUnionBaseProperties: true
                    }
                }
            ]
        });

        const union = findRootSchema(ir, "MyUnion");
        const keys = commonPropertyKeysOf(union);

        // `inlineShared` is declared inline on each variant and not inherited from a shared parent,
        // so the inference should still pick it up.
        expect(keys).toContain("inlineShared");
    });

    it("lifts an inferred property as optional when any variant declares it optional", () => {
        const doc: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0" },
            paths: {
                "/things": {
                    get: {
                        operationId: "listThings",
                        responses: {
                            "200": {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/MyUnion" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    VariantA: {
                        type: "object",
                        properties: {
                            kind: { type: "string", enum: ["a"] },
                            sometimesRequired: { type: "string" }
                        },
                        // sometimesRequired is OPTIONAL here
                        required: ["kind"]
                    },
                    VariantB: {
                        type: "object",
                        properties: {
                            kind: { type: "string", enum: ["b"] },
                            sometimesRequired: { type: "string" }
                        },
                        // sometimesRequired is REQUIRED here
                        required: ["kind", "sometimesRequired"]
                    },
                    MyUnion: {
                        type: "object",
                        oneOf: [{ $ref: "#/components/schemas/VariantA" }, { $ref: "#/components/schemas/VariantB" }],
                        discriminator: {
                            propertyName: "kind",
                            mapping: {
                                a: "#/components/schemas/VariantA",
                                b: "#/components/schemas/VariantB"
                            }
                        }
                    }
                }
            }
        };

        const ir = parse({
            context: mockTaskContext(),
            documents: [
                {
                    type: "openapi",
                    value: doc,
                    source: Source.openapi({ file: "test.yml" }),
                    settings: {
                        ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                        shouldInferDiscriminatedUnionBaseProperties: true
                    }
                }
            ]
        });

        const union = findRootSchema(ir, "MyUnion");
        // Lifted, but as optional — because at least one variant doesn't require it.
        expect(commonPropertyOptionalityOf(union, "sometimesRequired")).toBe("optional");
    });
});
