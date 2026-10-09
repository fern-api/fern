import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../openapi/v3/OpenAPIV3ParserContext.js";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";
import { convertSchema } from "../schema/convertSchemas.js";

function createMockTaskContext(): TaskContext {
    return {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;
}

function createDocument(schemas: Record<string, OpenAPIV3.SchemaObject>): OpenAPIV3.Document {
    return {
        openapi: "3.0.0",
        info: { title: "Test API", version: "1.0.0" },
        paths: {},
        components: { schemas }
    };
}

function createContext(
    document: OpenAPIV3.Document,
    source: Source,
    inlineAllOfSchemas: boolean
): OpenAPIV3ParserContext {
    return new OpenAPIV3ParserContext({
        document,
        taskContext: createMockTaskContext(),
        authHeaders: new Set(),
        options: { ...DEFAULT_PARSE_OPENAPI_SETTINGS, inlineAllOfSchemas },
        source,
        namespace: undefined
    });
}

// With inlineAllOfSchemas=false, properties declared only on a referenced parent live on the
// parent (via extends) and are not present on the child, so those assertions are gated.
function getPropertyTypes(
    document: OpenAPIV3.Document,
    schemaName: string,
    inlineAllOfSchemas: boolean
): Record<string, string> {
    const source: Source = Source.openapi({ file: "test.yaml" });
    const context = createContext(document, source, inlineAllOfSchemas);
    const schema = document.components?.schemas?.[schemaName];
    if (schema == null) {
        throw new Error(`schema ${schemaName} not found`);
    }
    const result = convertSchema(schema, false, false, context, [schemaName], source, undefined);
    if (result.type !== "object") {
        throw new Error(`expected ${schemaName} to convert to an object, got ${result.type}`);
    }
    return Object.fromEntries(result.properties.map((property) => [property.key, property.schema.type]));
}

describe.each([false, true])("allOf required union (inlineAllOfSchemas=%s)", (inlineAllOfSchemas) => {
    it("keeps a parent-required property required when a child allOf branch redeclares it", () => {
        const document = createDocument({
            Parent: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    mask: { type: "string" }
                },
                required: ["name", "mask"]
            },
            Child: {
                allOf: [
                    { $ref: "#/components/schemas/Parent" },
                    {
                        type: "object",
                        properties: {
                            mask: { type: "string" },
                            owners: { type: "array", items: { type: "string" } }
                        },
                        required: ["owners"]
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.mask).toBe("primitive");
        expect(types.owners).toBe("array");
    });

    it("produces nullable (not optional) when a parent-required nullable property is redeclared as nullable", () => {
        const document = createDocument({
            AccountBase: {
                type: "object",
                properties: {
                    account_id: { type: "string" },
                    mask: { type: "string", nullable: true },
                    official_name: { type: "string", nullable: true },
                    subtype: { type: "string", nullable: true }
                },
                required: ["account_id", "mask", "official_name", "subtype"]
            },
            AccountIdentity: {
                allOf: [
                    { $ref: "#/components/schemas/AccountBase" },
                    {
                        type: "object",
                        additionalProperties: true,
                        properties: {
                            official_name: { type: "string", nullable: true },
                            mask: { type: "string", nullable: true },
                            owners: { type: "array", items: { type: "string" } }
                        },
                        required: ["owners"]
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "AccountIdentity", inlineAllOfSchemas);
        expect(types.mask).toBe("nullable");
        expect(types.official_name).toBe("nullable");
        expect(types.owners).toBe("array");
        if (inlineAllOfSchemas) {
            expect(types.subtype).toBe("nullable");
        }
    });

    it("keeps a property required only in the child required, and leaves parent-optional properties optional", () => {
        const document = createDocument({
            Parent: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    note: { type: "string" }
                },
                required: ["id"]
            },
            Child: {
                allOf: [
                    { $ref: "#/components/schemas/Parent" },
                    {
                        type: "object",
                        properties: {
                            child_only: { type: "string" },
                            extra: { type: "string" }
                        },
                        required: ["child_only"]
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.child_only).toBe("primitive");
        expect(types.extra).toBe("optional");
        if (inlineAllOfSchemas) {
            expect(types.note).toBe("optional");
            expect(types.id).toBe("primitive");
        }
    });

    it("unions required across a three-level allOf chain", () => {
        const document = createDocument({
            Grandparent: {
                type: "object",
                properties: {
                    gp: { type: "string", nullable: true }
                },
                required: ["gp"]
            },
            Parent: {
                allOf: [
                    { $ref: "#/components/schemas/Grandparent" },
                    {
                        type: "object",
                        properties: {
                            p: { type: "string" }
                        },
                        required: ["p"]
                    }
                ]
            },
            Child: {
                allOf: [
                    { $ref: "#/components/schemas/Parent" },
                    {
                        type: "object",
                        properties: {
                            gp: { type: "string", nullable: true },
                            p: { type: "string" },
                            c: { type: "string" }
                        }
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.gp).toBe("nullable");
        expect(types.p).toBe("primitive");
        expect(types.c).toBe("optional");
    });

    it("keeps a parent-required property required when redeclared in the child's top-level properties", () => {
        const document = createDocument({
            Parent: {
                type: "object",
                properties: {
                    mask: { type: "string", nullable: true }
                },
                required: ["mask"]
            },
            Child: {
                allOf: [{ $ref: "#/components/schemas/Parent" }],
                properties: {
                    mask: { type: "string", nullable: true },
                    extra: { type: "string" }
                }
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.mask).toBe("nullable");
        expect(types.extra).toBe("optional");
    });

    it("marks a parent-defined nullable property required-nullable when only the child branch requires it", () => {
        const document = createDocument({
            TransactionBase: {
                type: "object",
                properties: {
                    transaction_id: { type: "string" },
                    pending_transaction_id: { type: "string", nullable: true },
                    account_owner: { type: "string", nullable: true },
                    iso_currency_code: { type: "string", nullable: true },
                    merchant_name: { type: "string", nullable: true }
                },
                required: ["transaction_id", "iso_currency_code"]
            },
            Transaction: {
                allOf: [
                    { $ref: "#/components/schemas/TransactionBase" },
                    {
                        type: "object",
                        properties: {
                            authorized_date: { type: "string", format: "date", nullable: true }
                        },
                        required: ["account_owner", "pending_transaction_id", "authorized_date"]
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "Transaction", inlineAllOfSchemas);
        expect(types.account_owner).toBe("nullable");
        expect(types.pending_transaction_id).toBe("nullable");
        expect(types.authorized_date).toBe("nullable");
        expect(types.merchant_name).toBe(inlineAllOfSchemas ? "optional" : undefined);
        if (inlineAllOfSchemas) {
            expect(types.transaction_id).toBe("primitive");
            expect(types.iso_currency_code).toBe("nullable");
        }
    });

    it("marks a parent-defined non-nullable property required when only the child's top-level required lists it", () => {
        const document = createDocument({
            Parent: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    note: { type: "string" }
                }
            },
            Child: {
                allOf: [
                    { $ref: "#/components/schemas/Parent" },
                    {
                        type: "object",
                        properties: {
                            extra: { type: "string" }
                        }
                    }
                ],
                required: ["name"]
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.name).toBe("primitive");
        expect(types.extra).toBe("optional");
        expect(types.note).toBe(inlineAllOfSchemas ? "optional" : undefined);
    });

    it("marks a grandparent-defined property required when only the grandchild branch requires it", () => {
        const document = createDocument({
            Grandparent: {
                type: "object",
                properties: {
                    gp_nullable: { type: "string", nullable: true },
                    gp_plain: { type: "string" },
                    gp_untouched: { type: "string", nullable: true }
                }
            },
            Parent: {
                allOf: [
                    { $ref: "#/components/schemas/Grandparent" },
                    {
                        type: "object",
                        properties: {
                            p: { type: "string" }
                        }
                    }
                ]
            },
            Child: {
                allOf: [
                    { $ref: "#/components/schemas/Parent" },
                    {
                        type: "object",
                        properties: {
                            c: { type: "string" }
                        },
                        required: ["gp_nullable", "gp_plain", "p"]
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.gp_nullable).toBe("nullable");
        expect(types.gp_plain).toBe("primitive");
        expect(types.p).toBe("primitive");
        expect(types.c).toBe("optional");
        expect(types.gp_untouched).toBe(inlineAllOfSchemas ? "optional" : undefined);
    });

    it("does not redeclare a parent property that the parent already requires", () => {
        const document = createDocument({
            Parent: {
                type: "object",
                properties: {
                    mask: { type: "string", nullable: true }
                },
                required: ["mask"]
            },
            Child: {
                allOf: [
                    { $ref: "#/components/schemas/Parent" },
                    {
                        type: "object",
                        properties: {
                            extra: { type: "string" }
                        },
                        required: ["mask"]
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.mask).toBe(inlineAllOfSchemas ? "nullable" : undefined);
        expect(types.extra).toBe("optional");
    });

    it("leaves a property optional when no allOf branch requires it", () => {
        const document = createDocument({
            Parent: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    nullable_note: { type: "string", nullable: true },
                    plain_note: { type: "string" }
                },
                required: ["id"]
            },
            Child: {
                allOf: [
                    { $ref: "#/components/schemas/Parent" },
                    {
                        type: "object",
                        properties: {
                            child_nullable: { type: "string", nullable: true },
                            child_plain: { type: "string" }
                        }
                    }
                ]
            }
        });
        const types = getPropertyTypes(document, "Child", inlineAllOfSchemas);
        expect(types.child_nullable).toBe("optional");
        expect(types.child_plain).toBe("optional");
        expect(types.nullable_note).toBe(inlineAllOfSchemas ? "optional" : undefined);
        expect(types.plain_note).toBe(inlineAllOfSchemas ? "optional" : undefined);
        if (inlineAllOfSchemas) {
            expect(types.id).toBe("primitive");
        }
    });

    it("does not change behavior for schemas without allOf", () => {
        const document = createDocument({
            Plain: {
                type: "object",
                properties: {
                    a: { type: "string" },
                    b: { type: "string", nullable: true },
                    c: { type: "string" }
                },
                required: ["a"]
            }
        });
        const types = getPropertyTypes(document, "Plain", inlineAllOfSchemas);
        expect(types.a).toBe("primitive");
        expect(types.b).toBe("optional");
        expect(types.c).toBe("optional");
    });
});
