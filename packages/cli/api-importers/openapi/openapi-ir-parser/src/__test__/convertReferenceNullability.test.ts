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

function createContext(document: OpenAPIV3.Document, source: Source): OpenAPIV3ParserContext {
    return new OpenAPIV3ParserContext({
        document,
        taskContext: createMockTaskContext(),
        authHeaders: new Set(),
        options: DEFAULT_PARSE_OPENAPI_SETTINGS,
        source,
        namespace: undefined
    });
}

describe("convertReferenceObject nullability", () => {
    const source: Source = Source.openapi({ file: "test.yaml" });

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
