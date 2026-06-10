import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { ErrorGenerator } from "../error/ErrorGenerator.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const caseConverter = new CaseConverter({ generationLanguage: "rust", keywords: undefined, smartCasing: true });

// Mock function to create IR with specific error definitions
function createMockIR(
    errors: Record<string, FernIr.ErrorDeclaration>,
    types: Record<string, FernIr.TypeDeclaration> = {}
): FernIr.IntermediateRepresentation {
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
        types,
        services: {}
    } as unknown as FernIr.IntermediateRepresentation;
}

// Mock function to create error declarations
function createErrorDeclaration(name: string, statusCode: number, type: "text" | "json" = "text"): FernIr.ErrorDeclaration {
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
    } as unknown as FernIr.ErrorDeclaration;
}

// Mock function to create context
function createMockContext(ir: FernIr.IntermediateRepresentation): SdkGeneratorContext {
    return {
        ir,
        case: caseConverter,
        getClientName: () => "TestClient",
        customConfig: {},
        hasWebSocketChannels: () => false,
        getUniqueTypeNameForReference: (ref: FernIr.DeclaredTypeName) =>
            caseConverter.pascalSafe(ref.name)
    } as SdkGeneratorContext;
}

/** Helper to build a named type name object from a PascalCase string. */
function makeName(pascal: string): FernIr.Name {
    return {
        originalName: pascal,
        camelCase: { unsafeName: pascal.charAt(0).toLowerCase() + pascal.slice(1), safeName: pascal.charAt(0).toLowerCase() + pascal.slice(1) },
        snakeCase: { unsafeName: pascal.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, ""), safeName: pascal.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "") },
        screamingSnakeCase: { unsafeName: pascal.replace(/([A-Z])/g, "_$1").toUpperCase().replace(/^_/, ""), safeName: pascal.replace(/([A-Z])/g, "_$1").toUpperCase().replace(/^_/, "") },
        pascalCase: { unsafeName: pascal, safeName: pascal }
    };
}

/**
 * Create an error declaration whose body type references a named object
 * schema with the given properties.
 */
function createObjectTypedError(
    errorName: string,
    statusCode: number,
    bodyTypeId: string,
    properties: Array<{ name: string; valueType: FernIr.TypeReference }>
): {
    errorDecl: FernIr.ErrorDeclaration;
    typeDecl: FernIr.TypeDeclaration;
} {
    const errorDecl = {
        name: {
            errorId: `${errorName}Id`,
            fernFilepath: { allParts: [], file: undefined, packagePath: [] },
            name: makeName(errorName)
        },
        statusCode,
        type: {
            type: "named" as const,
            typeId: bodyTypeId,
            fernFilepath: { allParts: [], file: undefined, packagePath: [] },
            name: makeName(bodyTypeId.replace("Body", ""))
        }
    } as unknown as FernIr.ErrorDeclaration;

    const typeDecl = {
        name: {
            typeId: bodyTypeId,
            fernFilepath: { allParts: [], file: undefined, packagePath: [] },
            name: makeName(bodyTypeId.replace("Body", ""))
        },
        shape: {
            type: "object" as const,
            properties: properties.map((p) => ({
                name: {
                    name: makeName(p.name),
                    wireValue: p.name
                },
                valueType: p.valueType
            }))
        }
    } as unknown as FernIr.TypeDeclaration;

    return { errorDecl, typeDecl };
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

    describe("object-typed error fields", () => {
        it("should import and deserialize named types in error body fields", async () => {
            // Simulate an error like Sarvam's 403: body has { message, error: ErrorDetails }
            const errorDetailsTypeId = "ErrorDetailsType";
            const { errorDecl, typeDecl } = createObjectTypedError(
                "ForbiddenError",
                403,
                "ForbiddenErrorBody",
                [
                    { name: "message", valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } } as unknown as FernIr.TypeReference },
                    {
                        name: "error",
                        valueType: {
                            type: "named",
                            typeId: errorDetailsTypeId,
                            fernFilepath: { allParts: [], file: undefined, packagePath: [] },
                            name: makeName("ErrorDetails")
                        } as unknown as FernIr.TypeReference
                    }
                ]
            );

            // The ErrorDetails type itself (used for import collection, not for field generation)
            const errorDetailsDecl = {
                name: {
                    typeId: errorDetailsTypeId,
                    fernFilepath: { allParts: [], file: undefined, packagePath: [] },
                    name: makeName("ErrorDetails")
                },
                shape: {
                    type: "object" as const,
                    properties: [
                        {
                            name: { name: makeName("RequestId"), wireValue: "request_id" },
                            valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } } as unknown as FernIr.TypeReference
                        },
                        {
                            name: { name: makeName("Message"), wireValue: "message" },
                            valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } } as unknown as FernIr.TypeReference
                        },
                        {
                            name: { name: makeName("Code"), wireValue: "code" },
                            valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } } as unknown as FernIr.TypeReference
                        }
                    ]
                }
            } as unknown as FernIr.TypeDeclaration;

            const errors = { ForbiddenError: errorDecl };
            const types = {
                ForbiddenErrorBody: typeDecl,
                [errorDetailsTypeId]: errorDetailsDecl
            };
            const ir = createMockIR(errors, types);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/object-typed-error-fields.rs");
        });

        it("should handle mix of string and object-typed fields in same error", async () => {
            const errorDetailsTypeId = "ErrorDetailsType";
            const { errorDecl, typeDecl } = createObjectTypedError(
                "RateLimitError",
                429,
                "RateLimitErrorBody",
                [
                    { name: "message", valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } } as unknown as FernIr.TypeReference },
                    {
                        name: "error",
                        valueType: {
                            type: "named",
                            typeId: errorDetailsTypeId,
                            fernFilepath: { allParts: [], file: undefined, packagePath: [] },
                            name: makeName("ErrorDetails")
                        } as unknown as FernIr.TypeReference
                    },
                    { name: "retryAfterSeconds", valueType: { type: "primitive", primitive: { v1: "UINT_64", v2: undefined } } as unknown as FernIr.TypeReference }
                ]
            );

            const errorDetailsDecl = {
                name: {
                    typeId: errorDetailsTypeId,
                    fernFilepath: { allParts: [], file: undefined, packagePath: [] },
                    name: makeName("ErrorDetails")
                },
                shape: {
                    type: "object" as const,
                    properties: []
                }
            } as unknown as FernIr.TypeDeclaration;

            const errors = { RateLimitError: errorDecl };
            const types = {
                RateLimitErrorBody: typeDecl,
                [errorDetailsTypeId]: errorDetailsDecl
            };
            const ir = createMockIR(errors, types);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            await expect(result).toMatchFileSnapshot("snapshots/mixed-typed-error-fields.rs");
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
