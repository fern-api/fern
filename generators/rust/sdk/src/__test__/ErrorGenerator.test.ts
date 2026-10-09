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

function createName(value: string): unknown {
    return {
        originalName: value,
        camelCase: { unsafeName: value, safeName: value },
        snakeCase: { unsafeName: value, safeName: value },
        screamingSnakeCase: { unsafeName: value.toUpperCase(), safeName: value.toUpperCase() },
        pascalCase: { unsafeName: value, safeName: value }
    };
}

function createProperty(wireValue: string, valueType: FernIr.TypeReference): FernIr.ObjectProperty {
    return {
        name: { wireValue, name: createName(wireValue) },
        valueType
    } as unknown as FernIr.ObjectProperty;
}

function createObjectTypeDeclaration(properties: FernIr.ObjectProperty[]): FernIr.TypeDeclaration {
    return {
        shape: { type: "object", properties, extends: [] }
    } as unknown as FernIr.TypeDeclaration;
}

const INTEGER_TYPE = { type: "primitive", primitive: { v1: "INTEGER" } } as unknown as FernIr.TypeReference;
function namedType(typeId: string): FernIr.TypeReference {
    return { type: "named", typeId, name: createName(typeId) } as unknown as FernIr.TypeReference;
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
        getUniqueTypeNameForReference: (reference: FernIr.DeclaredTypeName) => reference.typeId,
        getDateTimeType: () => "offset"
    } as unknown as SdkGeneratorContext;
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

    describe("named error body types", () => {
        it("emits matching field types, serde extraction, and a prelude import for non-primitive body fields", async () => {
            // ServerError's body type carries a non-string primitive (`code: i64`)
            // and a named type (`detail: ErrorResponseDetail`). Both must compile:
            // the field types must match how `from_response` extracts them, and the
            // named type must be brought into scope.
            const errors = {
                ServerError: createErrorDeclaration("ServerError", 500, "json")
            };
            const types = {
                ServerErrorBody: createObjectTypeDeclaration([
                    createProperty("message", { type: "primitive", primitive: { v1: "STRING" } } as unknown as FernIr.TypeReference),
                    createProperty("code", INTEGER_TYPE),
                    createProperty("detail", namedType("ErrorResponseDetail"))
                ])
            };
            const ir = createMockIR(errors, types);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();

            // Bug #1: the named type must be imported.
            expect(result).toContain("use crate::prelude::*;");
            // Bug #2: field types match the values extracted in `from_response`.
            expect(result).toContain("code: Option<i64>");
            expect(result).toContain("detail: Option<ErrorResponseDetail>");
            expect(result).toContain("serde_json::from_value::<i64>(v.clone()).ok()");
            expect(result).toContain("serde_json::from_value::<ErrorResponseDetail>(v.clone()).ok()");
            // `message` is lifted to the shared variant field, not duplicated.
            expect(result).not.toContain("message: Option<String>");

            await expect(result).toMatchFileSnapshot("snapshots/named-error-body.rs");
        });

        it("does not import the prelude when all error body fields are primitives", async () => {
            const errors = {
                SimpleError: createErrorDeclaration("SimpleError", 400, "json")
            };
            const types = {
                SimpleErrorBody: createObjectTypeDeclaration([
                    createProperty("message", { type: "primitive", primitive: { v1: "STRING" } } as unknown as FernIr.TypeReference),
                    createProperty("reason", { type: "primitive", primitive: { v1: "STRING" } } as unknown as FernIr.TypeReference)
                ])
            };
            const ir = createMockIR(errors, types);
            const context = createMockContext(ir);
            const generator = new ErrorGenerator(context);

            const result = generator.generateErrorRs();
            expect(result).not.toContain("use crate::prelude::*;");
            expect(result).toContain("reason: Option<String>");
        });
    });
});
