import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../openapi/v3/OpenAPIV3ParserContext.js";
import { convertToSingleRequest } from "../openapi/v3/converters/endpoint/convertRequest.js";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";

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

describe("convertToSingleRequest", () => {
    const source: Source = Source.openapi({ file: "test.yaml" });
    const document: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Test API", version: "1.0.0" },
        paths: {}
    };

    it("converts a text/plain request body with a schema instead of dropping it", () => {
        const context = createContext(document, source);
        const result = convertToSingleRequest({
            content: {
                "text/plain": {
                    schema: { type: "string" }
                }
            },
            description: undefined,
            document,
            context,
            requestBreadcrumbs: ["Echo"],
            source,
            namespace: undefined,
            bodyRequired: true
        });

        expect(result).toBeDefined();
        expect(result?.type).toBe("json");
        if (result?.type === "json") {
            expect(result.contentType).toBe("text/plain");
            expect(result.required).toBe(true);
            expect(result.schema.type).toBe("primitive");
            if (result.schema.type === "primitive") {
                expect(result.schema.schema.type).toBe("string");
            }
        }
    });

    it("prefers application/json when both json and an unrecognized media type declare schemas", () => {
        const context = createContext(document, source);
        const result = convertToSingleRequest({
            content: {
                "text/plain": {
                    schema: { type: "string" }
                },
                "application/json": {
                    schema: { type: "object", properties: { message: { type: "string" } } }
                }
            },
            description: undefined,
            document,
            context,
            requestBreadcrumbs: ["Echo"],
            source,
            namespace: undefined,
            bodyRequired: undefined
        });

        expect(result).toBeDefined();
        expect(result?.type).toBe("json");
        if (result?.type === "json") {
            expect(result.contentType).toBe("application/json");
        }
    });

    it("still returns undefined when no recognized media type declares a schema", () => {
        const context = createContext(document, source);
        const result = convertToSingleRequest({
            content: {
                "text/plain": {}
            },
            description: undefined,
            document,
            context,
            requestBreadcrumbs: ["Echo"],
            source,
            namespace: undefined,
            bodyRequired: undefined
        });

        expect(result).toBeUndefined();
    });
});
