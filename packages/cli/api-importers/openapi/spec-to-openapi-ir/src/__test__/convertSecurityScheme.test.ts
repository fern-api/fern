import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { convertSecurityScheme } from "../openapi/v3/converters/convertSecurityScheme";
import { OpenAPIV3ParserContext } from "../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options";

describe("convertSecurityScheme", () => {
    const mockTaskContext = {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;

    const source: Source = Source.openapi({
        file: "test.yaml"
    });

    it("should convert referenced security schemes", () => {
        // Create an OpenAPI document with a referenced security scheme
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {},
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            }
        };

        // Create a context for reference resolution
        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        // Create a reference to the security scheme
        const securitySchemeRef: OpenAPIV3.ReferenceObject = {
            $ref: "#/components/securitySchemes/BearerAuth"
        };

        // Convert the referenced security scheme
        const result = convertSecurityScheme(securitySchemeRef, source, mockTaskContext, context);

        // Verify the result
        expect(result).toBeDefined();
        expect(result?.type).toBe("bearer");
        if (result?.type === "bearer") {
            expect(result.tokenVariableName).toBeUndefined();
            expect(result.tokenEnvVar).toBeUndefined();
        }
    });

    it("should throw an error when resolving reference without context", () => {
        const securitySchemeRef: OpenAPIV3.ReferenceObject = {
            $ref: "#/components/securitySchemes/BearerAuth"
        };

        expect(() => {
            convertSecurityScheme(securitySchemeRef, source, mockTaskContext);
        }).toThrow("Converting referenced security schemes requires context");
    });

    it("should convert direct security schemes without context", () => {
        const securityScheme: OpenAPIV3.SecuritySchemeObject = {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
        };

        const result = convertSecurityScheme(securityScheme, source, mockTaskContext);

        expect(result).toBeDefined();
        expect(result?.type).toBe("bearer");
        if (result?.type === "bearer") {
            expect(result.tokenVariableName).toBeUndefined();
            expect(result.tokenEnvVar).toBeUndefined();
        }
    });
});
