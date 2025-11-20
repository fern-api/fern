import * as FernIr from "@fern-fern/ir-sdk/api";

import { ErrorDeclaration, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { describe, expect, it } from "vitest";
import { ErrorGenerator } from "../error/ErrorGenerator";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

// Mock function to create IR with specific error definitions
function createMockIR(errors: Record<string, ErrorDeclaration>): IntermediateRepresentation {
    return {
        apiName: {
            originalName: "TestAPI",
            camelCase: { unsafeName: "testApi", safeName: "testApi" },
            snakeCase: { unsafeName: "test_api", safeName: "test_api" },
            screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" },
            pascalCase: { unsafeName: "TestAPI", safeName: "TestAPI" }
        },
        apiVersion: "1.0.0",
        errors,
        types: {},
        services: {}
    } as unknown as IntermediateRepresentation;
}

// Mock function to create error declarations
function createErrorDeclaration(name: string, statusCode: number, type: "text" | "json" = "text"): ErrorDeclaration {
    return {
        name: {
            errorId: `${name}Id`,
            fernFilepath: {
                allParts: [],
                file: undefined,
                packagePath: []
            },
            name: {
                originalName: name,
                camelCase: {
                    unsafeName: name.toLowerCase(),
                    safeName: name.toLowerCase()
                },
                snakeCase: {
                    unsafeName: name.toLowerCase(),
                    safeName: name.toLowerCase()
                },
                screamingSnakeCase: {
                    unsafeName: name.toUpperCase(),
                    safeName: name.toUpperCase()
                },
                pascalCase: { unsafeName: name, safeName: name }
            }
        },
        statusCode,
        type:
            type === "text"
                ? undefined
                : ({
                      type: "named",
                      typeId: `${name}Body`
                  } as FernIr.TypeReference.Named)
    } as unknown as ErrorDeclaration;
}

// Mock function to create context
function createMockContext(ir: IntermediateRepresentation): SdkGeneratorContext {
    return {
        ir,
        getClientName: () => "TestClient",
        customConfig: {}
    } as SdkGeneratorContext;
}

describe("ErrorGenerator", () => {
    describe("generateErrorRs", () => {
        it("should generate basic error enum structure", async () => {
            const errors = {
                UnauthorizedError: createErrorDeclaration("UnauthorizedError", 401),
                NotFoundError: createErrorDeclaration("NotFoundError", 404)
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/basic-error-enum.rs");
        });

        it("should generate API-specific error variants", async () => {
            const errors = {
                ValidationError: createErrorDeclaration("ValidationError", 422, "json"),
                RateLimitError: createErrorDeclaration("RateLimitError", 429, "json"),
                InternalServerError: createErrorDeclaration("InternalServerError", 500)
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/api-specific-variants.rs");
        });

        it("should generate status code mapping", async () => {
            const errors = {
                BadRequestError: createErrorDeclaration("BadRequestError", 400),
                UnauthorizedError: createErrorDeclaration("UnauthorizedError", 401),
                ForbiddenError: createErrorDeclaration("ForbiddenError", 403),
                NotFoundError: createErrorDeclaration("NotFoundError", 404)
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/status-code-mapping.rs");
        });

        it("should handle different HTTP status codes with context-rich fields", async () => {
            const errors = {
                UnauthorizedError: createErrorDeclaration("UnauthorizedError", 401, "json"),
                NotFoundError: createErrorDeclaration("NotFoundError", 404, "json"),
                ValidationError: createErrorDeclaration("ValidationError", 422, "json"),
                RateLimitError: createErrorDeclaration("RateLimitError", 429, "json"),
                InternalServerError: createErrorDeclaration("InternalServerError", 500, "json")
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/context-rich-fields.rs");
        });

        it("should generate different error messages based on status codes", async () => {
            const errors = {
                UnauthorizedError: createErrorDeclaration("UnauthorizedError", 401, "json"),
                ForbiddenError: createErrorDeclaration("ForbiddenError", 403, "json"),
                NotFoundError: createErrorDeclaration("NotFoundError", 404, "json"),
                ConflictError: createErrorDeclaration("ConflictError", 409, "json"),
                ValidationError: createErrorDeclaration("ValidationError", 422, "json")
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/different-error-messages.rs");
        });

        it("should handle text-only errors", async () => {
            const errors = {
                SimpleError: createErrorDeclaration("SimpleError", 400, "text"),
                GenericError: createErrorDeclaration("GenericError", 500, "text")
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/text-only-errors.rs");
        });

        it("should handle empty errors gracefully", async () => {
            const errors = {};
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/empty-errors.rs");
        });
    });

    describe("error field parsing", () => {
        it("should generate JSON parsing for structured errors", async () => {
            const errors = {
                ValidationError: createErrorDeclaration("ValidationError", 422, "json"),
                ConflictError: createErrorDeclaration("ConflictError", 409, "json")
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/json-parsing.rs");
        });

        it("should provide default values for optional fields", async () => {
            const errors = {
                RateLimitError: createErrorDeclaration("RateLimitError", 429, "json"),
                MaintenanceError: createErrorDeclaration("MaintenanceError", 503, "json")
            };
            const ir = createMockIR(errors);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/default-field-values.rs");
        });
    });
});
