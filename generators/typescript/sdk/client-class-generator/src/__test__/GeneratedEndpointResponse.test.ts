import { FernIr } from "@fern-fern/ir-sdk";
import { getOriginalName, getTextOfTsNode } from "@fern-typescript/commons";
import { caseConverter, createHttpEndpoint, createNameAndWireValue } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { GeneratedNonThrowingEndpointResponse } from "../endpoints/default/endpoint-response/GeneratedNonThrowingEndpointResponse.js";
import { GeneratedThrowingEndpointResponse } from "../endpoints/default/endpoint-response/GeneratedThrowingEndpointResponse.js";

// ──────────────────────────────────────────────────────────────────────────────
// Shared test helpers
// ──────────────────────────────────────────────────────────────────────────────

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
const LIST_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.list(STRING_TYPE));
const OPTIONAL_LIST_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.optional(LIST_STRING_TYPE));
const NULLABLE_LIST_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.nullable(LIST_STRING_TYPE));
const INTEGER_TYPE = FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined });

function createResponseProperty(name: string, valueType?: FernIr.TypeReference): FernIr.ResponseProperty {
    return {
        property: {
            name: createNameAndWireValue(name),
            valueType: valueType ?? LIST_STRING_TYPE,
            availability: undefined,
            docs: undefined,
            propertyAccess: undefined,
            v2Examples: undefined
        },
        propertyPath: []
    };
}

function createRequestProperty(name: string, valueType?: FernIr.TypeReference): FernIr.RequestProperty {
    return {
        property: FernIr.RequestPropertyValue.body({
            name: createNameAndWireValue(name),
            valueType: valueType ?? STRING_TYPE,
            availability: undefined,
            docs: undefined,
            propertyAccess: undefined,
            v2Examples: undefined
        }),
        propertyPath: []
    };
}

function createErrorName(name: string): FernIr.DeclaredErrorName {
    return {
        errorId: `error_${name}` as FernIr.ErrorId,
        fernFilepath: {
            allParts: [],
            packagePath: [],
            file: undefined
        },
        name: {
            originalName: name,
            camelCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
            snakeCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
            screamingSnakeCase: { unsafeName: name.toUpperCase(), safeName: name.toUpperCase() },
            pascalCase: { unsafeName: name, safeName: name }
        }
    };
}

function createResponseError(name: string): FernIr.ResponseError {
    return {
        error: createErrorName(name),
        docs: undefined
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(): any {
    return {
        includeSerdeLayer: true,
        type: {
            getReferenceToType: (typeRef: FernIr.TypeReference) => {
                const typeText =
                    typeRef.type === "primitive"
                        ? typeRef.primitive.v1 === "STRING"
                            ? "string"
                            : typeRef.primitive.v1 === "INTEGER"
                              ? "number"
                              : "unknown"
                        : "SomeType";
                return {
                    typeNode: ts.factory.createTypeReferenceNode(typeText),
                    responseTypeNode: undefined,
                    isOptional: false
                };
            },
            getReferenceToResponsePropertyType: () =>
                ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)),
            generateGetterForResponseProperty: ({
                property,
                variable
            }: {
                property: FernIr.ResponseProperty;
                variable: string;
            }) =>
                ts.factory.createPropertyAccessChain(
                    ts.factory.createIdentifier(variable),
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    caseConverter.camelUnsafe(property.property.name)
                ),
            generateGetterForRequestProperty: ({
                property,
                variable
            }: {
                property: FernIr.RequestProperty;
                variable: string;
            }) =>
                ts.factory.createPropertyAccessChain(
                    ts.factory.createIdentifier(variable),
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    caseConverter.camelUnsafe(property.property.name)
                ),
            generateSetterForRequestPropertyAsString: ({ property }: { property: FernIr.RequestProperty }) =>
                ts.factory.createStringLiteral(caseConverter.camelUnsafe(property.property.name)),
            getTypeDeclaration: () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            })
        },
        coreUtilities: {
            stream: {
                Stream: {
                    _getReferenceToType: (itemType: ts.TypeNode) =>
                        ts.factory.createTypeReferenceNode("Stream", [itemType]),
                    _construct: ({
                        stream
                    }: {
                        stream: ts.Expression;
                        eventShape: unknown;
                        signal: ts.Expression | undefined;
                        parse: ts.Expression;
                    }) => ts.factory.createNewExpression(ts.factory.createIdentifier("Stream"), undefined, [stream])
                }
            },
            fetcher: {
                BinaryResponse: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.BinaryResponse")
                },
                APIResponse: {
                    _getReferenceToType: (successType: ts.TypeNode, errorType: ts.TypeNode) =>
                        ts.factory.createTypeReferenceNode("core.APIResponse", [successType, errorType]),
                    SuccessfulResponse: {
                        body: "body",
                        headers: "headers",
                        rawResponse: "rawResponse",
                        _build: (data: ts.Expression, _headers: ts.Expression, _rawResponse: ts.Expression) => data
                    },
                    FailedResponse: {
                        error: "error",
                        rawResponse: "rawResponse",
                        _build: (data: ts.Expression, _rawResponse: ts.Expression) => data
                    }
                },
                Fetcher: {
                    Error: {
                        reason: "reason"
                    },
                    FailedStatusCodeError: {
                        _reasonLiteralValue: "status-code",
                        statusCode: "statusCode",
                        body: "body"
                    }
                },
                getHeader: {
                    _invoke: ({ header }: { referenceToResponseHeaders: ts.Expression; header: string }) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("getHeader"), undefined, [
                            ts.factory.createStringLiteral(header)
                        ])
                }
            },
            utils: {
                setObjectProperty: {
                    _invoke: ({
                        referenceToObject,
                        path,
                        value
                    }: {
                        referenceToObject: ts.Expression;
                        path: ts.Expression;
                        value: ts.Expression;
                    }) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("core.setObjectProperty"),
                            undefined,
                            [referenceToObject, path, value]
                        )
                }
            }
        },
        externalDependencies: {
            stream: {
                Readable: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("Readable")
                }
            }
        },
        sdkError: {
            getReferenceToError: (errorName: FernIr.DeclaredErrorName) => ({
                getExpression: () => ts.factory.createIdentifier(`${caseConverter.pascalUnsafe(errorName.name)}Error`)
            }),
            getErrorDeclaration: (errorName: FernIr.DeclaredErrorName) => ({
                discriminantValue: {
                    wireValue: getOriginalName(errorName.name)
                }
            }),
            getGeneratedSdkError: () => ({
                type: "class" as const,
                build: (
                    _context: unknown,
                    {
                        referenceToBody
                    }: { referenceToBody: ts.Expression | undefined; referenceToRawResponse: ts.Expression }
                ) =>
                    ts.factory.createNewExpression(ts.factory.createIdentifier("SdkError"), undefined, [
                        referenceToBody ?? ts.factory.createIdentifier("undefined")
                    ])
            })
        },
        sdkErrorSchema: {
            getGeneratedSdkErrorSchema: () => ({
                deserializeBody: (_context: unknown, { referenceToBody }: { referenceToBody: ts.Expression }) =>
                    ts.factory.createCallExpression(ts.factory.createIdentifier("deserializeError"), undefined, [
                        referenceToBody
                    ])
            })
        },
        sdkEndpointTypeSchemas: {
            getGeneratedEndpointTypeSchemas: () => ({
                deserializeResponse: (body: ts.Expression) =>
                    ts.factory.createCallExpression(ts.factory.createIdentifier("deserialize"), undefined, [body]),
                deserializeError: (body: ts.Expression) =>
                    ts.factory.createCallExpression(ts.factory.createIdentifier("deserializeError"), undefined, [body]),
                getReferenceToRawError: () => ts.factory.createTypeReferenceNode("RawError"),
                deserializeStreamData: ({
                    referenceToRawStreamData
                }: {
                    context: unknown;
                    referenceToRawStreamData: ts.Expression;
                }) =>
                    ts.factory.createCallExpression(ts.factory.createIdentifier("deserializeStreamData"), undefined, [
                        referenceToRawStreamData
                    ])
            })
        },
        endpointErrorUnion: {
            getGeneratedEndpointErrorUnion: () => ({
                getErrorUnion: () => ({
                    getReferenceTo: () => ts.factory.createTypeReferenceNode("ErrorUnion"),
                    buildWithBuilder: ({
                        discriminantValueToBuild
                    }: {
                        discriminantValueToBuild: number;
                        builderArgument: ts.Expression | undefined;
                        context: unknown;
                    }) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("buildError"), undefined, [
                            ts.factory.createNumericLiteral(discriminantValueToBuild)
                        ]),
                    buildUnknown: ({ existingValue }: { existingValue: ts.Expression; context: unknown }) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("buildUnknown"), undefined, [
                            existingValue
                        ])
                })
            })
        },
        genericAPISdkError: {
            getGeneratedGenericAPISdkError: () => ({
                build: (
                    _context: unknown,
                    {
                        statusCode,
                        responseBody
                    }: {
                        message: string | undefined;
                        statusCode: ts.Expression;
                        responseBody: ts.Expression;
                        rawResponse: ts.Expression;
                    }
                ) =>
                    ts.factory.createNewExpression(ts.factory.createIdentifier("GenericAPIError"), undefined, [
                        statusCode,
                        responseBody
                    ])
            })
        },
        nonStatusCodeErrorHandler: {
            getReferenceToHandleNonStatusCodeError: () => ({
                getExpression: () => ts.factory.createIdentifier("handleNonStatusCodeError")
            })
        },
        importsManager: {},
        exportsManager: {},
        sourceFile: {},
        case: caseConverter
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for ErrorResolver
function createMockErrorResolver(errors?: Record<string, { statusCode: number }>): any {
    return {
        getErrorDeclarationFromName: (errorName: FernIr.DeclaredErrorName) => {
            const key = getOriginalName(errorName.name);
            return errors?.[key] ?? { statusCode: 400 };
        }
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for GeneratedSdkClientClassImpl
function createMockClientClass(): any {
    return {
        getReferenceToAbortSignal: () => ts.factory.createIdentifier("abortSignal")
    };
}

function serializeStatements(stmts: ts.Statement[]): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile("test.ts", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    return stmts.map((stmt) => printer.printNode(ts.EmitHint.Unspecified, stmt, sourceFile)).join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// GeneratedThrowingEndpointResponse tests
// ──────────────────────────────────────────────────────────────────────────────

describe("GeneratedThrowingEndpointResponse", () => {
    function createInstance(opts?: {
        response?: FernIr.HttpResponseBody;
        errors?: FernIr.ResponseError[];
        errorDiscrimination?: FernIr.ErrorDiscriminationStrategy;
        pagination?: FernIr.Pagination;
        includeContentHeaders?: boolean;
        method?: FernIr.HttpMethod;
        offsetSemantics?: "item-index" | "page-index";
        errorResolverErrors?: Record<string, { statusCode: number }>;
    }) {
        const endpoint = createHttpEndpoint();
        if (opts?.errors != null) {
            endpoint.errors = opts.errors;
        }
        if (opts?.pagination != null) {
            endpoint.pagination = opts.pagination;
        }
        if (opts?.method != null) {
            endpoint.method = opts.method;
        }
        if (opts?.response != null) {
            endpoint.response = {
                body: opts.response,
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
        }

        return new GeneratedThrowingEndpointResponse({
            packageId: { isRoot: true },
            endpoint,
            response: opts?.response as
                | FernIr.HttpResponseBody.Json
                | FernIr.HttpResponseBody.FileDownload
                | FernIr.HttpResponseBody.Streaming
                | FernIr.HttpResponseBody.Text
                | FernIr.HttpResponseBody.Bytes
                | undefined,
            errorDiscriminationStrategy: opts?.errorDiscrimination ?? FernIr.ErrorDiscriminationStrategy.statusCode(),
            errorResolver: createMockErrorResolver(opts?.errorResolverErrors),
            includeContentHeadersOnResponse: opts?.includeContentHeaders ?? false,
            clientClass: createMockClientClass(),
            streamType: "wrapper",
            fileResponseType: "stream",
            offsetSemantics: opts?.offsetSemantics ?? "item-index"
        });
    }

    describe("getResponseVariableName", () => {
        it("returns _response", () => {
            const instance = createInstance();
            expect(instance.getResponseVariableName()).toBe("_response");
        });
    });

    describe("getReturnType", () => {
        it("returns void for no response", () => {
            const instance = createInstance();
            const context = createMockContext();
            const result = instance.getReturnType(context);
            expect(getTextOfTsNode(result)).toBe("void");
        });

        it("returns string for text response", () => {
            const instance = createInstance({
                response: FernIr.HttpResponseBody.text({ docs: undefined, v2Examples: undefined })
            });
            const context = createMockContext();
            const result = instance.getReturnType(context);
            expect(getTextOfTsNode(result)).toBe("string");
        });
    });

    describe("getNamesOfThrownExceptions", () => {
        it("returns empty array when no errors", () => {
            const instance = createInstance();
            const context = createMockContext();
            expect(instance.getNamesOfThrownExceptions(context)).toEqual([]);
        });

        it("returns error names when errors are defined", () => {
            const instance = createInstance({
                errors: [createResponseError("BadRequest"), createResponseError("NotFound")]
            });
            const context = createMockContext();
            const names = instance.getNamesOfThrownExceptions(context);
            expect(names).toEqual(["BadRequestError", "NotFoundError"]);
        });
    });

    describe("getPaginationInfo", () => {
        it("returns undefined when no pagination", () => {
            const instance = createInstance();
            const context = createMockContext();
            expect(instance.getPaginationInfo(context)).toBeUndefined();
        });

        describe("cursor pagination", () => {
            it("returns cursor pagination info", () => {
                const cursorPagination: FernIr.Pagination = FernIr.Pagination.cursor({
                    page: createRequestProperty("cursor"),
                    next: createResponseProperty("nextCursor", STRING_TYPE),
                    results: createResponseProperty("items", LIST_STRING_TYPE)
                });
                const instance = createInstance({ pagination: cursorPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(info!.type).toBe("cursor");
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.hasNextPage)).toMatchSnapshot();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.getItems)).toMatchSnapshot();
            });

            it("returns undefined when results type is not a list", () => {
                const cursorPagination: FernIr.Pagination = FernIr.Pagination.cursor({
                    page: createRequestProperty("cursor"),
                    next: createResponseProperty("nextCursor", STRING_TYPE),
                    results: createResponseProperty("items", STRING_TYPE)
                });
                const instance = createInstance({ pagination: cursorPagination });
                const context = createMockContext();
                expect(instance.getPaginationInfo(context)).toBeUndefined();
            });

            it("handles optional list results type", () => {
                const cursorPagination: FernIr.Pagination = FernIr.Pagination.cursor({
                    page: createRequestProperty("cursor"),
                    next: createResponseProperty("nextCursor", STRING_TYPE),
                    results: createResponseProperty("items", OPTIONAL_LIST_STRING_TYPE)
                });
                const instance = createInstance({ pagination: cursorPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(info!.type).toBe("cursor");
            });

            it("handles nullable list results type", () => {
                const cursorPagination: FernIr.Pagination = FernIr.Pagination.cursor({
                    page: createRequestProperty("cursor"),
                    next: createResponseProperty("nextCursor", STRING_TYPE),
                    results: createResponseProperty("items", NULLABLE_LIST_STRING_TYPE)
                });
                const instance = createInstance({ pagination: cursorPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(info!.type).toBe("cursor");
            });
        });

        describe("offset pagination", () => {
            it("returns offset pagination info without step", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty("page", INTEGER_TYPE),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: undefined,
                    hasNextPage: undefined
                });
                const instance = createInstance({ pagination: offsetPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(info!.type).toBe("offset");
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.hasNextPage)).toMatchSnapshot();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.getItems)).toMatchSnapshot();
            });

            it("returns offset-step pagination info with step and item-index semantics", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty("offset", INTEGER_TYPE),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: createRequestProperty("limit", INTEGER_TYPE),
                    hasNextPage: undefined
                });
                const instance = createInstance({
                    pagination: offsetPagination,
                    offsetSemantics: "item-index"
                });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(info!.type).toBe("offset-step");
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.hasNextPage)).toMatchSnapshot();
            });

            it("returns offset pagination info with step and page-index semantics", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty("page", INTEGER_TYPE),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: createRequestProperty("limit", INTEGER_TYPE),
                    hasNextPage: undefined
                });
                const instance = createInstance({
                    pagination: offsetPagination,
                    offsetSemantics: "page-index"
                });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(info!.type).toBe("offset");
            });

            it("uses hasNextPage property when available", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty("page", INTEGER_TYPE),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: undefined,
                    hasNextPage: createResponseProperty(
                        "hasMore",
                        FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined })
                    )
                });
                const instance = createInstance({ pagination: offsetPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.hasNextPage)).toContain("hasMore");
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.hasNextPage)).toMatchSnapshot();
            });

            it("returns undefined when results type is not a list", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty("page", INTEGER_TYPE),
                    results: createResponseProperty("items", STRING_TYPE),
                    step: undefined,
                    hasNextPage: undefined
                });
                const instance = createInstance({ pagination: offsetPagination });
                const context = createMockContext();
                expect(instance.getPaginationInfo(context)).toBeUndefined();
            });
        });

        describe("custom pagination", () => {
            it("returns custom pagination info", () => {
                const customPagination: FernIr.Pagination = FernIr.Pagination.custom({
                    results: createResponseProperty("items", LIST_STRING_TYPE)
                });
                const instance = createInstance({ pagination: customPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(info!.type).toBe("custom");
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                expect(getTextOfTsNode(info!.hasNextPage)).toBe("false");
            });

            it("loadPage throws error for custom pagination", () => {
                const customPagination: FernIr.Pagination = FernIr.Pagination.custom({
                    results: createResponseProperty("items", LIST_STRING_TYPE)
                });
                const instance = createInstance({ pagination: customPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                const loadPageText = serializeStatements(info!.loadPage);
                expect(loadPageText).toContain("Custom pagination requires manual implementation");
            });

            it("returns undefined when results type is not a list", () => {
                const customPagination: FernIr.Pagination = FernIr.Pagination.custom({
                    results: createResponseProperty("items", STRING_TYPE)
                });
                const instance = createInstance({ pagination: customPagination });
                const context = createMockContext();
                expect(instance.getPaginationInfo(context)).toBeUndefined();
            });
        });

        describe("getDefaultPaginationValue", () => {
            it("uses integer default from v2 schema", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty(
                        "page",
                        FernIr.TypeReference.primitive({
                            v1: "INTEGER",
                            v2: FernIr.PrimitiveTypeV2.integer({
                                default: 5,
                                validation: undefined
                            })
                        })
                    ),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: undefined,
                    hasNextPage: undefined
                });
                const instance = createInstance({ pagination: offsetPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // The offset initialization should use default of 5
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                if (info!.type === "offset" || info!.type === "offset-step") {
                    // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                    const initText = serializeStatements([info!.initializeOffset]);
                    expect(initText).toContain("5");
                }
            });

            it("falls back to 1 when no default is defined", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty("page", INTEGER_TYPE),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: undefined,
                    hasNextPage: undefined
                });
                const instance = createInstance({ pagination: offsetPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                if (info!.type === "offset" || info!.type === "offset-step") {
                    // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                    const initText = serializeStatements([info!.initializeOffset]);
                    expect(initText).toContain("1");
                }
            });

            it("unwraps optional type before extracting default", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty(
                        "page",
                        FernIr.TypeReference.container(
                            FernIr.ContainerType.optional(
                                FernIr.TypeReference.primitive({
                                    v1: "INTEGER",
                                    v2: FernIr.PrimitiveTypeV2.integer({
                                        default: 3,
                                        validation: undefined
                                    })
                                })
                            )
                        )
                    ),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: undefined,
                    hasNextPage: undefined
                });
                const instance = createInstance({ pagination: offsetPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                if (info!.type === "offset" || info!.type === "offset-step") {
                    // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                    const initText = serializeStatements([info!.initializeOffset]);
                    expect(initText).toContain("3");
                }
            });

            it("unwraps nullable type before extracting default", () => {
                const offsetPagination: FernIr.Pagination = FernIr.Pagination.offset({
                    page: createRequestProperty(
                        "page",
                        FernIr.TypeReference.container(
                            FernIr.ContainerType.nullable(
                                FernIr.TypeReference.primitive({
                                    v1: "INTEGER",
                                    v2: FernIr.PrimitiveTypeV2.integer({
                                        default: 7,
                                        validation: undefined
                                    })
                                })
                            )
                        )
                    ),
                    results: createResponseProperty("items", LIST_STRING_TYPE),
                    step: undefined,
                    hasNextPage: undefined
                });
                const instance = createInstance({ pagination: offsetPagination });
                const context = createMockContext();
                const info = instance.getPaginationInfo(context);
                expect(info).toBeDefined();
                // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                if (info!.type === "offset" || info!.type === "offset-step") {
                    // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
                    const initText = serializeStatements([info!.initializeOffset]);
                    expect(initText).toContain("7");
                }
            });
        });
    });

    describe("getReturnResponseStatements", () => {
        it("generates return statements for no response", () => {
            const instance = createInstance();
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("_response.ok");
            expect(output).toMatchSnapshot();
        });

        it("generates return statements for json response", () => {
            const jsonResponse = FernIr.HttpResponseBody.json(
                FernIr.JsonResponse.response({
                    responseBodyType: STRING_TYPE,
                    docs: undefined,
                    v2Examples: undefined
                })
            );
            const endpoint = createHttpEndpoint();
            endpoint.response = {
                body: jsonResponse,
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
            const instance = new GeneratedThrowingEndpointResponse({
                packageId: { isRoot: true },
                endpoint,
                response: jsonResponse as FernIr.HttpResponseBody.Json,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
                errorResolver: createMockErrorResolver(),
                includeContentHeadersOnResponse: false,
                clientClass: createMockClientClass(),
                streamType: "wrapper",
                fileResponseType: "stream",
                offsetSemantics: "item-index"
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("deserialize");
            expect(output).toMatchSnapshot();
        });

        it("generates return statements with status code error discrimination", () => {
            const instance = createInstance({
                errors: [createResponseError("BadRequest"), createResponseError("NotFound")],
                errorDiscrimination: FernIr.ErrorDiscriminationStrategy.statusCode(),
                errorResolverErrors: {
                    BadRequest: { statusCode: 400 },
                    NotFound: { statusCode: 404 }
                }
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("400");
            expect(output).toContain("404");
            expect(output).toMatchSnapshot();
        });

        it("generates return statements with property error discrimination", () => {
            const instance = createInstance({
                errors: [createResponseError("BadRequest"), createResponseError("NotFound")],
                errorDiscrimination: FernIr.ErrorDiscriminationStrategy.property({
                    discriminant: createNameAndWireValue("errorName"),
                    contentProperty: createNameAndWireValue("content")
                }),
                errorResolverErrors: {
                    BadRequest: { statusCode: 400 },
                    NotFound: { statusCode: 404 }
                }
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("errorName");
            expect(output).toMatchSnapshot();
        });

        it("deduplicates errors with same status code", () => {
            const instance = createInstance({
                errors: [createResponseError("BadRequest"), createResponseError("ValidationError")],
                errorDiscrimination: FernIr.ErrorDiscriminationStrategy.statusCode(),
                errorResolverErrors: {
                    BadRequest: { statusCode: 400 },
                    ValidationError: { statusCode: 400 }
                }
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            // Should only have one case clause for status code 400
            const matches = output.match(/case 400/g);
            expect(matches).toHaveLength(1);
        });

        it("generates HEAD method response with headers", () => {
            const instance = createInstance({ method: FernIr.HttpMethod.Head });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("headers");
            expect(output).toMatchSnapshot();
        });

        it("generates file download with content headers", () => {
            const fileResponse = FernIr.HttpResponseBody.fileDownload({ docs: undefined, v2Examples: undefined });
            const endpoint = createHttpEndpoint();
            endpoint.response = {
                body: fileResponse,
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
            const instance = new GeneratedThrowingEndpointResponse({
                packageId: { isRoot: true },
                endpoint,
                response: fileResponse as FernIr.HttpResponseBody.FileDownload,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
                errorResolver: createMockErrorResolver(),
                includeContentHeadersOnResponse: true,
                clientClass: createMockClientClass(),
                streamType: "wrapper",
                fileResponseType: "stream",
                offsetSemantics: "item-index"
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("contentLengthInBytes");
            expect(output).toContain("contentType");
            expect(output).toContain("Content-Length");
            expect(output).toContain("Content-Type");
            expect(output).toMatchSnapshot();
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// GeneratedNonThrowingEndpointResponse tests
// ──────────────────────────────────────────────────────────────────────────────

describe("GeneratedNonThrowingEndpointResponse", () => {
    function createInstance(opts?: {
        response?: FernIr.HttpResponseBody;
        errors?: FernIr.ResponseError[];
        errorDiscrimination?: FernIr.ErrorDiscriminationStrategy;
        errorResolverErrors?: Record<string, { statusCode: number }>;
    }) {
        const endpoint = createHttpEndpoint();
        if (opts?.errors != null) {
            endpoint.errors = opts.errors;
        }
        if (opts?.response != null) {
            endpoint.response = {
                body: opts.response,
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
        }

        return new GeneratedNonThrowingEndpointResponse({
            packageId: { isRoot: true },
            endpoint,
            response: opts?.response as
                | FernIr.HttpResponseBody.Json
                | FernIr.HttpResponseBody.FileDownload
                | FernIr.HttpResponseBody.Streaming
                | FernIr.HttpResponseBody.Text
                | FernIr.HttpResponseBody.Bytes
                | undefined,
            errorDiscriminationStrategy: opts?.errorDiscrimination ?? FernIr.ErrorDiscriminationStrategy.statusCode(),
            errorResolver: createMockErrorResolver(opts?.errorResolverErrors),
            includeSerdeLayer: true,
            streamType: "wrapper",
            fileResponseType: "stream"
        });
    }

    describe("basic methods", () => {
        it("getPaginationInfo always returns undefined", () => {
            const instance = createInstance();
            expect(instance.getPaginationInfo()).toBeUndefined();
        });

        it("getResponseVariableName returns _response", () => {
            const instance = createInstance();
            expect(instance.getResponseVariableName()).toBe("_response");
        });

        it("getNamesOfThrownExceptions returns empty array", () => {
            const instance = createInstance();
            expect(instance.getNamesOfThrownExceptions()).toEqual([]);
        });
    });

    describe("getReturnType", () => {
        it("returns APIResponse<void, ErrorUnion> for no response", () => {
            const instance = createInstance();
            const context = createMockContext();
            const result = instance.getReturnType(context);
            expect(getTextOfTsNode(result)).toContain("core.APIResponse");
        });
    });

    describe("getReturnResponseStatements", () => {
        it("generates ok response with undefined body when no response type", () => {
            const instance = createInstance();
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("_response.ok");
            expect(output).toContain("data");
            expect(output).toMatchSnapshot();
        });

        it("generates ok response with deserialized body for json response", () => {
            const jsonResponse = FernIr.HttpResponseBody.json(
                FernIr.JsonResponse.response({
                    responseBodyType: STRING_TYPE,
                    docs: undefined,
                    v2Examples: undefined
                })
            );
            const endpoint = createHttpEndpoint();
            endpoint.response = {
                body: jsonResponse,
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
            const instance = new GeneratedNonThrowingEndpointResponse({
                packageId: { isRoot: true },
                endpoint,
                response: jsonResponse as FernIr.HttpResponseBody.Json,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
                errorResolver: createMockErrorResolver(),
                includeSerdeLayer: true,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("deserialize");
            expect(output).toMatchSnapshot();
        });

        it("skips error handling when no errors defined", () => {
            const instance = createInstance({ errors: [] });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            // Should only have the ok check and the unknown error return, no switch
            expect(output).not.toContain("switch");
            expect(output).toContain("buildUnknown");
        });

        it("generates status code error switch for status code discrimination", () => {
            const instance = createInstance({
                errors: [createResponseError("BadRequest"), createResponseError("NotFound")],
                errorDiscrimination: FernIr.ErrorDiscriminationStrategy.statusCode(),
                errorResolverErrors: {
                    BadRequest: { statusCode: 400 },
                    NotFound: { statusCode: 404 }
                }
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("400");
            expect(output).toContain("404");
            expect(output).toContain("switch");
            expect(output).toMatchSnapshot();
        });

        it("generates property error switch for property discrimination", () => {
            const instance = createInstance({
                errors: [createResponseError("BadRequest")],
                errorDiscrimination: FernIr.ErrorDiscriminationStrategy.property({
                    discriminant: createNameAndWireValue("errorType"),
                    contentProperty: createNameAndWireValue("content")
                }),
                errorResolverErrors: {
                    BadRequest: { statusCode: 400 }
                }
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("errorType");
            expect(output).toMatchSnapshot();
        });

        it("always includes unknown error return", () => {
            const instance = createInstance({
                errors: [createResponseError("BadRequest")],
                errorResolverErrors: { BadRequest: { statusCode: 400 } }
            });
            const context = createMockContext();
            const stmts = instance.getReturnResponseStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("buildUnknown");
        });
    });
});
