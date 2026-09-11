import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
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

function createContext(document: OpenAPIV3.Document | OpenAPIV3_1.Document, source: Source): OpenAPIV3ParserContext {
    return new OpenAPIV3ParserContext({
        document: document as OpenAPIV3.Document,
        taskContext: createMockTaskContext(),
        authHeaders: new Set(),
        options: DEFAULT_PARSE_OPENAPI_SETTINGS,
        source,
        namespace: undefined
    });
}

describe("convertReferenceObject nullability", () => {
    const source: Source = Source.openapi({ file: "test.yaml" });

    it("preserves type-array nullability after converting a documented allOf reference", () => {
        const nullableDetails = {
            type: ["object", "null"],
            properties: {
                value: { type: "string" }
            },
            required: ["value"]
        } satisfies OpenAPIV3_1.SchemaObject;
        const firstProfile: OpenAPIV3.SchemaObject = {
            type: "object",
            properties: {
                details: { $ref: "#/components/schemas/NullableDetails" }
            },
            required: ["details"]
        };
        const composedProfile: OpenAPIV3.SchemaObject = {
            type: "object",
            properties: {
                details: {
                    allOf: [{ $ref: "#/components/schemas/NullableDetails" }, { description: "Nullable details" }]
                }
            },
            required: ["details"]
        };
        const secondProfile: OpenAPIV3.SchemaObject = {
            type: "object",
            properties: {
                details: { $ref: "#/components/schemas/NullableDetails" }
            },
            required: ["details"]
        };
        const document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    FirstProfile: firstProfile,
                    ComposedProfile: composedProfile,
                    SecondProfile: secondProfile,
                    NullableDetails: nullableDetails
                }
            }
        } satisfies OpenAPIV3_1.Document;
        const context = createContext(document, source);

        const convertedProfiles = [firstProfile, composedProfile, secondProfile].map((profile, index) =>
            convertSchema(profile, false, false, context, [`Profile${index + 1}`], source, undefined)
        );

        expect(
            convertedProfiles.map((profile) => {
                expect(profile.type).toBe("object");
                if (profile.type !== "object") {
                    return undefined;
                }
                return profile.properties.find((property) => property.key === "details")?.schema.type;
            })
        ).toEqual(["nullable", "nullable", "nullable"]);
        expect(nullableDetails.type).toEqual(["object", "null"]);
    });

    it("wraps a multi-type union in one nullable layer", () => {
        const schema: OpenAPIV3.SchemaObject = {};
        (schema as OpenAPIV3_1.SchemaObject).type = ["string", "integer", "null"];
        const document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {}
        } satisfies OpenAPIV3_1.Document;
        const context = createContext(document, source);

        const result = convertSchema(schema, false, false, context, ["NullableUnion"], source, undefined);

        expect(result.type).toBe("nullable");
        if (result.type !== "nullable") {
            return;
        }
        expect(result.value.type).toBe("oneOf");
        if (result.value.type !== "oneOf" || result.value.value.type !== "undiscriminated") {
            return;
        }
        expect(result.value.value.schemas.map((variant) => variant.type)).toEqual(["primitive", "primitive"]);
        expect((schema as OpenAPIV3_1.SchemaObject).type).toEqual(["string", "integer", "null"]);
    });

    it("propagates nullability from a referenced anyOf that includes a { type: null } branch", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    WateringSchedule: {
                        anyOf: [{ type: "string", enum: ["auto"] }, { type: "string", minLength: 1 }, { type: "null" }],
                        default: "auto"
                    } as unknown as OpenAPIV3.SchemaObject
                }
            }
        };
        const context = createContext(document, source);

        const result = convertSchema(
            { $ref: "#/components/schemas/WateringSchedule" },
            false,
            false,
            context,
            ["WateringSchedule"],
            source,
            undefined
        );

        expect(result.type).toBe("nullable");
    });

    it("does not add nullability when the referenced anyOf has no null branch", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    WateringSchedule: {
                        anyOf: [
                            { type: "string", enum: ["auto"] },
                            { type: "string", minLength: 1 }
                        ],
                        default: "auto"
                    } as unknown as OpenAPIV3.SchemaObject
                }
            }
        };
        const context = createContext(document, source);

        const result = convertSchema(
            { $ref: "#/components/schemas/WateringSchedule" },
            false,
            false,
            context,
            ["WateringSchedule"],
            source,
            undefined
        );

        expect(result.type).toBe("reference");
    });
});
