import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3DocumentMetadata } from "../openapi/v3/AbstractOpenAPIV3ParserContext.js";
import { stripBasePathFromPaths } from "../openapi/v3/extensions/getFernBasePath.js";
import { OpenAPIV3ParserContext } from "../openapi/v3/OpenAPIV3ParserContext.js";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";

const taskContext = {
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
} as unknown as TaskContext;

const source = Source.openapi({ file: "test.yaml" });

describe("OpenAPIV3ParserContext", () => {
    it("shares document metadata with the dummy context", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/widgets": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/widget_response" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    widget_response: { type: "object" }
                }
            }
        };

        const documentMetadata = new OpenAPIV3DocumentMetadata(document, DEFAULT_PARSE_OPENAPI_SETTINGS);
        const occurrenceSpy = vi.spyOn(documentMetadata, "getNumberOfOccurrencesForRef");
        const componentNameSpy = vi.spyOn(documentMetadata, "hasGeneratedComponentSchemaName");
        const context = new OpenAPIV3ParserContext({
            document,
            taskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined,
            documentMetadata
        });

        expect(context.DUMMY).not.toBe(context);
        expect(context.DUMMY.DUMMY).toBe(context.DUMMY);
        expect(context.getNumberOfOccurrencesForRef({ $ref: "#/components/schemas/widget_response" })).toBe(1);
        expect(context.DUMMY.getNumberOfOccurrencesForRef({ $ref: "#/components/schemas/widget_response" })).toBe(1);
        expect(context.hasGeneratedComponentSchemaName("WidgetResponse")).toBe(true);
        expect(context.DUMMY.hasGeneratedComponentSchemaName("WidgetResponse")).toBe(true);
        expect(occurrenceSpy).toHaveBeenCalledTimes(2);
        expect(componentNameSpy).toHaveBeenCalledTimes(2);
    });

    it("preserves reference counts when base path parameters are stripped", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/{account_id}/widgets": {
                    parameters: [
                        {
                            name: "account_id",
                            in: "path",
                            required: true,
                            schema: { $ref: "#/components/schemas/AccountId" }
                        }
                    ],
                    get: { responses: { "200": { description: "Success" } } }
                }
            },
            components: { schemas: { AccountId: { type: "string" } } }
        };
        const documentMetadata = new OpenAPIV3DocumentMetadata(document, DEFAULT_PARSE_OPENAPI_SETTINGS);

        stripBasePathFromPaths({
            openApi: document,
            basePath: "/{account_id}",
            rootPathParameterNames: new Set(["account_id"])
        });
        const context = new OpenAPIV3ParserContext({
            document,
            taskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined,
            documentMetadata
        });

        expect(context.getNumberOfOccurrencesForRef({ $ref: "#/components/schemas/AccountId" })).toBe(1);
    });
});
