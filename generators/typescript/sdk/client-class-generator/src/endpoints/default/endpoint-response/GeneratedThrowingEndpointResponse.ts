import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    getElementTypeFromArrayType,
    getFullPathForEndpoint,
    getTextOfTsNode,
    PackageId,
    removeUndefinedAndNullFromTypeNode,
    Stream
} from "@fern-typescript/commons";
import { FileContext, GeneratedSdkEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "../../../GeneratedSdkClientClassImpl.js";
import { GeneratedStreamingEndpointImplementation } from "../../GeneratedStreamingEndpointImplementation.js";
import { getAbortSignalExpression } from "../../utils/requestOptionsParameter.js";
import { GeneratedEndpointResponse, PaginationResponseInfo } from "./GeneratedEndpointResponse.js";
import {
    CONTENT_LENGTH_RESPONSE_KEY,
    CONTENT_LENGTH_VARIABLE_NAME,
    CONTENT_TYPE_RESPONSE_KEY,
    getSuccessReturnType,
    READABLE_RESPONSE_KEY
} from "./getSuccessReturnType.js";

export declare namespace GeneratedThrowingEndpointResponse {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        response:
            | FernIr.HttpResponseBody.Json
            | FernIr.HttpResponseBody.FileDownload
            | FernIr.HttpResponseBody.Streaming
            | FernIr.HttpResponseBody.Text
            | FernIr.HttpResponseBody.Bytes
            | undefined;
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
        includeContentHeadersOnResponse: boolean;
        clientClass: GeneratedSdkClientClassImpl;
        streamType: "wrapper" | "web";
        fileResponseType: "stream" | "binary-response";
        offsetSemantics: "item-index" | "page-index";
    }
}

export class GeneratedThrowingEndpointResponse implements GeneratedEndpointResponse {
    public static readonly RESPONSE_VARIABLE_NAME = "_response";

    private packageId: PackageId;
    private endpoint: FernIr.HttpEndpoint;
    private response:
        | FernIr.HttpResponseBody.Json
        | FernIr.HttpResponseBody.FileDownload
        | FernIr.HttpResponseBody.Streaming
        | FernIr.HttpResponseBody.Text
        | FernIr.HttpResponseBody.Bytes
        | undefined;
    private errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    private errorResolver: ErrorResolver;
    private includeContentHeadersOnResponse: boolean;
    private clientClass: GeneratedSdkClientClassImpl;
    private streamType: "wrapper" | "web";
    private readonly fileResponseType: "stream" | "binary-response";
    private readonly offsetSemantics: "item-index" | "page-index";

    constructor({
        packageId,
        endpoint,
        response,
        errorDiscriminationStrategy,
        errorResolver,
        includeContentHeadersOnResponse,
        clientClass,
        streamType,
        fileResponseType,
        offsetSemantics
    }: GeneratedThrowingEndpointResponse.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.response = response;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.errorResolver = errorResolver;
        this.includeContentHeadersOnResponse = includeContentHeadersOnResponse;
        this.clientClass = clientClass;
        this.streamType = streamType;
        this.fileResponseType = fileResponseType;
        this.offsetSemantics = offsetSemantics;
    }

    private getItemTypeFromListOrOptionalList(typeReference: FernIr.TypeReference): FernIr.TypeReference | undefined {
        if (typeReference.type === "container" && typeReference.container.type === "list") {
            return typeReference.container.list;
        }
        if (typeReference.type === "container" && typeReference.container.type === "optional") {
            return this.getItemTypeFromListOrOptionalList(typeReference.container.optional);
        }
        if (typeReference.type === "container" && typeReference.container.type === "nullable") {
            return this.getItemTypeFromListOrOptionalList(typeReference.container.nullable);
        }
        return undefined;
    }

    public getPaginationInfo(context: FileContext): PaginationResponseInfo | undefined {
        const successReturnType = getSuccessReturnType(this.endpoint, this.response, context, {
            includeContentHeadersOnResponse: this.includeContentHeadersOnResponse,
            streamType: this.streamType,
            fileResponseType: this.fileResponseType
        });

        if (this.endpoint.pagination != null) {
            switch (this.endpoint.pagination.type) {
                case "cursor":
                    return this.getCursorPaginationInfo({
                        context,
                        cursor: this.endpoint.pagination,
                        successReturnType
                    });
                case "offset":
                    return this.getOffsetPaginationInfo({
                        context,
                        offset: this.endpoint.pagination,
                        successReturnType
                    });
                case "custom":
                    return this.getCustomPaginationInfo({
                        context,
                        custom: this.endpoint.pagination,
                        successReturnType
                    });
                case "uri":
                    return this.getUriPaginationInfo({
                        context,
                        uri: this.endpoint.pagination,
                        successReturnType
                    });
                case "path":
                    return this.getPathPaginationInfo({
                        context,
                        path: this.endpoint.pagination,
                        successReturnType
                    });
            }
        }

        return undefined;
    }

    private getCursorPaginationInfo({
        context,
        cursor,
        successReturnType
    }: {
        context: FileContext;
        cursor: FernIr.CursorPagination;
        successReturnType: ts.TypeNode;
    }): PaginationResponseInfo | undefined {
        const itemValueType = cursor.results.property.valueType;

        const itemTypeReference = this.getItemTypeFromListOrOptionalList(itemValueType);
        if (itemTypeReference == null) {
            return undefined;
        }

        const itemType = getElementTypeFromArrayType(
            removeUndefinedAndNullFromTypeNode(
                context.type.getReferenceToResponsePropertyType({
                    responseType: successReturnType,
                    property: cursor.results
                })
            )
        );

        // hasNextPage checks if next property is not null
        const nextPropertyAccess = context.type.generateGetterForResponseProperty({
            property: cursor.next,
            variable: "response",
            isVariableOptional: true
        });

        const nextPropertyIsNonNull = ts.factory.createBinaryExpression(
            nextPropertyAccess,
            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            ts.factory.createNull()
        );

        const nextPropertyIsStringType = ts.factory.createBinaryExpression(
            ts.factory.createTypeOfExpression(nextPropertyAccess),
            ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
            ts.factory.createStringLiteral("string")
        );

        const nextPropertyIsEmptyString = ts.factory.createBinaryExpression(
            nextPropertyAccess,
            ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
            ts.factory.createStringLiteral("")
        );

        const nextPropertyIsStringAndEmpty = ts.factory.createBinaryExpression(
            nextPropertyIsStringType,
            ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
            nextPropertyIsEmptyString
        );

        const nextPropertyIsNotEmptyString = ts.factory.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            nextPropertyIsStringAndEmpty
        );

        const hasNextPage = ts.factory.createBinaryExpression(
            nextPropertyIsNonNull,
            ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
            nextPropertyIsNotEmptyString
        );

        // getItems gets the items
        const getItems = ts.factory.createBinaryExpression(
            context.type.generateGetterForResponseProperty({
                property: cursor.results,
                variable: "response",
                isVariableOptional: true
            }),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createArrayLiteralExpression([], false)
        );

        // loadPage
        const pagePropertyPathForSet = context.type.generateSetterForRequestPropertyAsString({
            property: cursor.page
        });
        const loadPage = [
            ts.factory.createReturnStatement(
                ts.factory.createCallExpression(ts.factory.createIdentifier("list"), undefined, [
                    context.coreUtilities.utils.setObjectProperty._invoke({
                        referenceToObject: ts.factory.createIdentifier("request"),
                        path: pagePropertyPathForSet,
                        value: nextPropertyAccess
                    })
                ])
            )
        ];

        return {
            type: "cursor",
            itemType: itemType,
            responseType: successReturnType,
            hasNextPage,
            getItems,
            loadPage
        };
    }

    private getOffsetPaginationInfo({
        context,
        offset,
        successReturnType
    }: {
        context: FileContext;
        offset: FernIr.OffsetPagination;
        successReturnType: ts.TypeNode;
    }): PaginationResponseInfo | undefined {
        const itemValueType = offset.results.property.valueType;

        const itemTypeReference = this.getItemTypeFromListOrOptionalList(itemValueType);
        if (itemTypeReference == null) {
            return undefined;
        }

        const itemType = getElementTypeFromArrayType(
            removeUndefinedAndNullFromTypeNode(
                context.type.getReferenceToResponsePropertyType({
                    responseType: successReturnType,
                    property: offset.results
                })
            )
        );

        // initializeOffset uses the offset property if set
        const pagePropertyDefault = this.getDefaultPaginationValue({ type: offset.page.property.valueType });
        const pagePropertyPathForSet = context.type.generateSetterForRequestPropertyAsString({
            property: offset.page
        });
        const pagePropertyAccess = context.type.generateGetterForRequestProperty({
            property: offset.page,
            variable: "request",
            isVariableOptional: true
        });
        const initializeOffset = ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier("_offset"),
                        undefined,
                        undefined,
                        ts.factory.createConditionalExpression(
                            ts.factory.createBinaryExpression(
                                pagePropertyAccess,
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                            pagePropertyAccess,
                            ts.factory.createToken(ts.SyntaxKind.ColonToken),
                            ts.factory.createNumericLiteral(pagePropertyDefault)
                        )
                    )
                ],
                ts.NodeFlags.Let
            )
        );

        // hasNextPage
        const itemsPropertyAccess = context.type.generateGetterForResponseProperty({
            property: offset.results,
            variable: "response",
            isVariableOptional: true
        });
        const itemsPropertyAccessWithoutOptional = context.type.generateGetterForResponseProperty({
            property: offset.results,
            variable: "response",
            noOptionalChaining: true
        });

        // Use offset.step if available to ensure that page is full before returning true
        const baseHasNextPage: ts.Expression =
            offset.step != null
                ? // If step is defined, check if items.length >= step (got full page)
                  (() => {
                      const stepPropertyAccess = context.type.generateGetterForRequestProperty({
                          property: offset.step,
                          variable: "request",
                          isVariableOptional: true
                      });
                      return ts.factory.createBinaryExpression(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createParenthesizedExpression(
                                  ts.factory.createBinaryExpression(
                                      itemsPropertyAccess,
                                      ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                      ts.factory.createArrayLiteralExpression([], false)
                                  )
                              ),
                              ts.factory.createIdentifier("length")
                          ),
                          ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
                          // access to stepPropertyAccess should be an integer so that it compares correctly to items.length
                          ts.factory.createCallExpression(
                              ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier("Math"),
                                  ts.factory.createIdentifier("floor")
                              ),
                              undefined,
                              [
                                  ts.factory.createParenthesizedExpression(
                                      ts.factory.createBinaryExpression(
                                          stepPropertyAccess,
                                          ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                          ts.factory.createNumericLiteral(
                                              this.getDefaultPaginationValue({
                                                  type: offset.step.property.valueType
                                              })
                                          )
                                      )
                                  )
                              ]
                          )
                      );
                  })()
                : // Fallback: check if items.length > 0 (got something)
                  ts.factory.createBinaryExpression(
                      ts.factory.createPropertyAccessExpression(
                          ts.factory.createParenthesizedExpression(
                              ts.factory.createBinaryExpression(
                                  itemsPropertyAccess,
                                  ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                  ts.factory.createArrayLiteralExpression([], false)
                              )
                          ),
                          ts.factory.createIdentifier("length")
                      ),
                      ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
                      ts.factory.createNumericLiteral("0")
                  );

        // If explicit hasNextPage property exists, it takes priority (?? to fallback to base check)
        const hasNextPage: ts.Expression =
            offset.hasNextPage != null
                ? (() => {
                      const hasNextPagePropertyAccess = context.type.generateGetterForResponseProperty({
                          property: offset.hasNextPage,
                          variable: "response",
                          isVariableOptional: true
                      });
                      return ts.factory.createBinaryExpression(
                          hasNextPagePropertyAccess,
                          ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                          baseHasNextPage
                      );
                  })()
                : baseHasNextPage;

        // getItems gets the items
        const getItems = ts.factory.createBinaryExpression(
            itemsPropertyAccess,
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createArrayLiteralExpression([], false)
        );

        // loadPage
        const incrementOffset =
            offset.step != null && this.offsetSemantics === "item-index"
                ? ts.factory.createExpressionStatement(
                      ts.factory.createBinaryExpression(
                          ts.factory.createIdentifier("_offset"),
                          ts.factory.createToken(ts.SyntaxKind.PlusEqualsToken),
                          ts.factory.createConditionalExpression(
                              ts.factory.createBinaryExpression(
                                  itemsPropertyAccess,
                                  ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                  ts.factory.createNull()
                              ),
                              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                              ts.factory.createPropertyAccessExpression(
                                  itemsPropertyAccessWithoutOptional,
                                  ts.factory.createIdentifier("length")
                              ),
                              ts.factory.createToken(ts.SyntaxKind.ColonToken),
                              ts.factory.createNumericLiteral("1")
                          )
                      )
                  )
                : ts.factory.createExpressionStatement(
                      ts.factory.createBinaryExpression(
                          ts.factory.createIdentifier("_offset"),
                          ts.factory.createToken(ts.SyntaxKind.PlusEqualsToken),
                          ts.factory.createNumericLiteral("1")
                      )
                  );
        const callEndpoint = ts.factory.createReturnStatement(
            ts.factory.createCallExpression(ts.factory.createIdentifier("list"), undefined, [
                context.coreUtilities.utils.setObjectProperty._invoke({
                    referenceToObject: ts.factory.createIdentifier("request"),
                    path: pagePropertyPathForSet,
                    value: ts.factory.createIdentifier("_offset")
                })
            ])
        );
        const loadPage = [incrementOffset, callEndpoint];

        return {
            type: offset.step != null && this.offsetSemantics === "item-index" ? "offset-step" : "offset",
            initializeOffset,
            itemType: itemType,
            responseType: successReturnType,
            hasNextPage,
            getItems,
            loadPage
        };
    }

    private getCustomPaginationInfo({
        context,
        custom,
        successReturnType
    }: {
        context: FileContext;
        custom: FernIr.CustomPagination;
        successReturnType: ts.TypeNode;
    }): PaginationResponseInfo | undefined {
        const itemValueType = custom.results.property.valueType;

        const itemTypeReference = this.getItemTypeFromListOrOptionalList(itemValueType);
        if (itemTypeReference == null) {
            return undefined;
        }

        const itemType = getElementTypeFromArrayType(
            removeUndefinedAndNullFromTypeNode(
                context.type.getReferenceToResponsePropertyType({
                    responseType: successReturnType,
                    property: custom.results
                })
            )
        );

        // For custom pagination, hasNextPage always returns false
        // The SDK author is responsible for implementing the pagination logic
        const hasNextPage = ts.factory.createFalse();

        // getItems gets the items from the results property
        const getItems = ts.factory.createBinaryExpression(
            context.type.generateGetterForResponseProperty({
                property: custom.results,
                variable: "response",
                isVariableOptional: true
            }),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createArrayLiteralExpression([], false)
        );

        // For custom pagination, loadPage throws an error
        // The SDK author is responsible for implementing the pagination logic
        const loadPage = [
            ts.factory.createThrowStatement(
                ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                    ts.factory.createStringLiteral(
                        "Custom pagination requires manual implementation. Override the loadPage method to implement pagination."
                    )
                ])
            )
        ];

        return {
            type: "custom",
            itemType: itemType,
            responseType: successReturnType,
            hasNextPage,
            getItems,
            loadPage
        };
    }

    private getUriPaginationInfo({
        context,
        uri,
        successReturnType
    }: {
        context: FileContext;
        uri: FernIr.UriPagination;
        successReturnType: ts.TypeNode;
    }): PaginationResponseInfo | undefined {
        return this.getUriOrPathPaginationInfo({
            context,
            nextProperty: uri.nextUri,
            results: uri.results,
            successReturnType,
            type: "uri"
        });
    }

    private getPathPaginationInfo({
        context,
        path,
        successReturnType
    }: {
        context: FileContext;
        path: FernIr.PathPagination;
        successReturnType: ts.TypeNode;
    }): PaginationResponseInfo | undefined {
        return this.getUriOrPathPaginationInfo({
            context,
            nextProperty: path.nextPath,
            results: path.results,
            successReturnType,
            type: "path"
        });
    }

    private getUriOrPathPaginationInfo({
        context,
        nextProperty,
        results,
        successReturnType,
        type
    }: {
        context: FileContext;
        nextProperty: FernIr.ResponseProperty;
        results: FernIr.ResponseProperty;
        successReturnType: ts.TypeNode;
        type: "uri" | "path";
    }): PaginationResponseInfo | undefined {
        const itemValueType = results.property.valueType;

        const itemTypeReference = this.getItemTypeFromListOrOptionalList(itemValueType);
        if (itemTypeReference == null) {
            return undefined;
        }

        const itemType = getElementTypeFromArrayType(
            removeUndefinedAndNullFromTypeNode(
                context.type.getReferenceToResponsePropertyType({
                    responseType: successReturnType,
                    property: results
                })
            )
        );

        // hasNextPage: check that next property is not null and not empty string.
        // Each call to generateGetterForResponseProperty creates a fresh AST node (nodes cannot be shared).
        const hasNextPage = ts.factory.createBinaryExpression(
            ts.factory.createBinaryExpression(
                context.type.generateGetterForResponseProperty({
                    property: nextProperty,
                    variable: "response",
                    isVariableOptional: true
                }),
                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                ts.factory.createNull()
            ),
            ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
            ts.factory.createBinaryExpression(
                context.type.generateGetterForResponseProperty({
                    property: nextProperty,
                    variable: "response",
                    isVariableOptional: true
                }),
                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                ts.factory.createStringLiteral("")
            )
        );

        // getItems: extract items from response
        const getItems = ts.factory.createBinaryExpression(
            context.type.generateGetterForResponseProperty({
                property: results,
                variable: "response",
                isVariableOptional: true
            }),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createArrayLiteralExpression([], false)
        );

        // loadPage: make a direct fetch to the next URI/path
        // For URI pagination: use the full URL directly
        // For path pagination: combine the next path with the base URL
        // Use non-null assertion since loadPage is only called when hasNextPage is true.
        // A fresh AST node is required here since nodes cannot be shared across parents.
        const nextPropertyForLoadPage = ts.factory.createNonNullExpression(
            context.type.generateGetterForResponseProperty({
                property: nextProperty,
                variable: "response",
                isVariableOptional: true
            })
        );
        const nextUrlExpression =
            type === "uri"
                ? nextPropertyForLoadPage
                : context.coreUtilities.urlUtils.join._invoke([
                      ts.factory.createIdentifier("_baseUrl"),
                      nextPropertyForLoadPage
                  ]);

        const loadPage = [
            ts.factory.createReturnStatement(
                ts.factory.createCallExpression(ts.factory.createIdentifier("list"), undefined, [nextUrlExpression])
            )
        ];

        return {
            type,
            itemType: itemType,
            responseType: successReturnType,
            hasNextPage,
            getItems,
            loadPage
        };
    }

    private getDefaultPaginationValue({ type }: { type: FernIr.TypeReference }): string {
        let defaultValue: string | undefined;

        FernIr.TypeReference._visit(type, {
            primitive: (primitiveType) => {
                const maybeV2Scheme = primitiveType.v2;
                if (maybeV2Scheme != null) {
                    defaultValue = FernIr.PrimitiveTypeV2._visit(maybeV2Scheme, {
                        integer: (it) => (it.default != null ? String(it.default) : undefined),
                        double: () => undefined,
                        string: () => undefined,
                        boolean: () => undefined,
                        long: () => undefined,
                        bigInteger: () => undefined,
                        uint: () => undefined,
                        uint64: () => undefined,
                        date: () => undefined,
                        dateTime: () => undefined,
                        dateTimeRfc2822: () => undefined,
                        uuid: () => undefined,
                        base64: () => undefined,
                        float: () => undefined,
                        _other: () => undefined
                    });
                }
            },
            container: (containerType) => {
                defaultValue = FernIr.ContainerType._visit(containerType, {
                    literal: () => undefined,
                    list: () => undefined,
                    set: () => undefined,
                    nullable: (nullableType) => this.getDefaultPaginationValue({ type: nullableType }),
                    optional: (optionalType) => this.getDefaultPaginationValue({ type: optionalType }),
                    map: () => undefined,
                    _other: () => undefined
                });
            },
            named: () => undefined,
            unknown: () => undefined,
            _other: () => undefined
        });

        return defaultValue != null ? defaultValue : "1";
    }

    public getResponseVariableName(): string {
        return GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME;
    }

    public getNamesOfThrownExceptions(context: FileContext): string[] {
        return this.endpoint.errors.map((error) =>
            getTextOfTsNode(context.sdkError.getReferenceToError(error.error).getExpression())
        );
    }

    public getReturnType(context: FileContext): ts.TypeNode {
        return getSuccessReturnType(this.endpoint, this.response, context, {
            includeContentHeadersOnResponse: this.includeContentHeadersOnResponse,
            streamType: this.streamType,
            fileResponseType: this.fileResponseType
        });
    }

    public getReturnResponseStatements(context: FileContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: FileContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock(this.getReturnStatementsForOkResponse(context), true)
        );
    }

    private getReturnStatementsForOkResponseBody(context: FileContext): ts.Statement[] {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        if (this.includeContentHeadersOnResponse && this.response?.type === "fileDownload") {
            return [
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(CONTENT_LENGTH_VARIABLE_NAME),
                                undefined,
                                undefined,
                                context.coreUtilities.fetcher.getHeader._invoke({
                                    referenceToResponseHeaders: this.getReferenceToResponseHeaders(context),
                                    header: "Content-Length"
                                })
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                ),
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("data"),
                                ts.factory.createObjectLiteralExpression(
                                    [
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(READABLE_RESPONSE_KEY),
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(
                                                    GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME
                                                ),
                                                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                                            )
                                        ),
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(CONTENT_LENGTH_RESPONSE_KEY),
                                            ts.factory.createConditionalExpression(
                                                ts.factory.createBinaryExpression(
                                                    ts.factory.createIdentifier(CONTENT_LENGTH_VARIABLE_NAME),
                                                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                                    ts.factory.createNull()
                                                ),
                                                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                                ts.factory.createCallExpression(
                                                    ts.factory.createIdentifier("Number"),
                                                    undefined,
                                                    [ts.factory.createIdentifier(CONTENT_LENGTH_VARIABLE_NAME)]
                                                ),
                                                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                                ts.factory.createIdentifier("undefined")
                                            )
                                        ),
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(CONTENT_TYPE_RESPONSE_KEY),
                                            context.coreUtilities.fetcher.getHeader._invoke({
                                                referenceToResponseHeaders: this.getReferenceToResponseHeaders(context),
                                                header: "Content-Type"
                                            })
                                        )
                                    ],
                                    true
                                )
                            ),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("rawResponse"),
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME
                                    ),
                                    ts.factory.createIdentifier("rawResponse")
                                )
                            )
                        ],
                        false
                    )
                )
            ];
        } else if (this.response?.type === "streaming") {
            const eventShape = this.response.value._visit<Stream.MessageEventShape | Stream.SSEEventShape>({
                sse: (sse) => ({
                    type: "sse" as const,
                    ...(sse.terminator != null
                        ? { streamTerminator: ts.factory.createStringLiteral(sse.terminator) }
                        : {}),
                    ...this.getEventDiscriminator(sse.payload, context)
                }),
                json: (json) => ({
                    type: "json",
                    messageTerminator: ts.factory.createStringLiteral(json.terminator ?? "\n")
                }),

                text: () => {
                    throw new Error("Text response type is not supported for streaming responses");
                },
                _other: ({ type }) => {
                    throw new Error(`Unknown response type: ${type}`);
                }
            });
            return [
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("data"),
                                context.coreUtilities.stream.Stream._construct({
                                    stream: ts.factory.createPropertyAccessChain(
                                        ts.factory.createIdentifier(
                                            GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME
                                        ),
                                        undefined,
                                        ts.factory.createIdentifier(
                                            context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                                        )
                                    ),
                                    eventShape,
                                    signal: getAbortSignalExpression({
                                        abortSignalReference: this.clientClass.getReferenceToAbortSignal.bind(
                                            this.clientClass
                                        )
                                    }),
                                    parse: context.includeSerdeLayer
                                        ? ts.factory.createArrowFunction(
                                              [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                                              undefined,
                                              [
                                                  ts.factory.createParameterDeclaration(
                                                      undefined,
                                                      undefined,
                                                      GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                  )
                                              ],
                                              undefined,
                                              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                              ts.factory.createBlock(
                                                  [
                                                      ts.factory.createReturnStatement(
                                                          context.sdkEndpointTypeSchemas
                                                              .getGeneratedEndpointTypeSchemas(
                                                                  this.packageId,
                                                                  this.endpoint.name
                                                              )
                                                              .deserializeStreamData({
                                                                  context,
                                                                  referenceToRawStreamData: ts.factory.createIdentifier(
                                                                      GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                                  )
                                                              })
                                                      )
                                                  ],
                                                  true
                                              )
                                          )
                                        : ts.factory.createArrowFunction(
                                              undefined,
                                              undefined,
                                              [
                                                  ts.factory.createParameterDeclaration(
                                                      undefined,
                                                      undefined,
                                                      GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                  )
                                              ],
                                              undefined,
                                              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                              ts.factory.createAsExpression(
                                                  ts.factory.createIdentifier(
                                                      GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                  ),
                                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                              )
                                          )
                                })
                            ),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("rawResponse"),
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME
                                    ),
                                    ts.factory.createIdentifier("rawResponse")
                                )
                            )
                        ],
                        false
                    )
                )
            ];
        }
        const deserializeToResponse = generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
        return [
            ts.factory.createReturnStatement(
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(ts.factory.createIdentifier("data"), deserializeToResponse),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("rawResponse"),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                                ts.factory.createIdentifier("rawResponse")
                            )
                        )
                    ],
                    false
                )
            )
        ];
    }

    private getReferenceToResponseHeaders(context: FileContext): ts.Expression {
        return ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier(context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.headers)
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createObjectLiteralExpression([], false)
        );
    }

    private getReferenceToRawResponse(context: FileContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            ts.factory.createIdentifier(context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.rawResponse)
        );
    }

    private getReturnFailedResponse(context: FileContext): ts.Statement[] {
        return [...this.getThrowsForStatusCodeErrors(context), ...this.getThrowsForNonStatusCodeErrors(context)];
    }

    private getThrowsForStatusCodeErrors(context: FileContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);
        const referenceToRawResponse = this.getReferenceToRawResponse(context);

        const defaultThrow = ts.factory.createThrowStatement(
            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                message: undefined,
                statusCode: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
                ),
                responseBody: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
                ),
                rawResponse: referenceToRawResponse
            })
        );

        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        referenceToError,
                        context.coreUtilities.fetcher.Fetcher.Error.reason
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral(
                        context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError._reasonLiteralValue
                    )
                ),
                ts.factory.createBlock(
                    [
                        this.endpoint.errors.length > 0
                            ? this.getSwitchStatementForErrors({
                                  context,
                                  generateCaseBody: (error) => {
                                      const generatedSdkError = context.sdkError.getGeneratedSdkError(error.error);
                                      if (generatedSdkError?.type !== "class") {
                                          throw new Error("Cannot throw error because it's not a class");
                                      }
                                      const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(
                                          error.error
                                      );
                                      return [
                                          ts.factory.createThrowStatement(
                                              generatedSdkError.build(context, {
                                                  referenceToBody:
                                                      generatedSdkErrorSchema != null
                                                          ? generatedSdkErrorSchema.deserializeBody(context, {
                                                                referenceToBody: referenceToErrorBody
                                                            })
                                                          : undefined,
                                                  referenceToRawResponse
                                              })
                                          )
                                      ];
                                  },
                                  defaultBody: [defaultThrow]
                              })
                            : defaultThrow
                    ],
                    true
                )
            )
        ];
    }

    private getSwitchStatementForErrors({
        context,
        generateCaseBody,
        defaultBody
    }: {
        context: FileContext;
        generateCaseBody: (responseError: FernIr.ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return FernIr.ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy,
                    generateCaseBody,
                    defaultBody
                }),
            statusCode: () =>
                this.getSwitchStatementForStatusCodeDiscriminatedErrors({
                    context,
                    generateCaseBody,
                    defaultBody
                }),
            _other: () => {
                throw new Error("Unknown FernIr.ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
        generateCaseBody,
        defaultBody
    }: {
        context: FileContext;
        propertyErrorDiscriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy;
        generateCaseBody: (responseError: FernIr.ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createElementAccessChain(
                ts.factory.createAsExpression(
                    this.getReferenceToErrorBody(context),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createStringLiteral(getWireValue(propertyErrorDiscriminationStrategy.discriminant))
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            getWireValue(context.sdkError.getErrorDeclaration(error.error).discriminantValue)
                        ),
                        generateCaseBody(error)
                    )
                ),
                ts.factory.createDefaultClause(defaultBody)
            ])
        );
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors({
        context,
        generateCaseBody,
        defaultBody
    }: {
        context: FileContext;
        generateCaseBody: (responseError: FernIr.ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        // Deduplicate errors by status code to prevent duplicate case clauses.
        // The first error for each status code wins (endpoint-specific errors come before global errors).
        const seenStatusCodes = new Set<number>();
        const deduplicatedErrors = this.endpoint.errors.filter((error) => {
            const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
            if (seenStatusCodes.has(errorDeclaration.statusCode)) {
                return false;
            }
            seenStatusCodes.add(errorDeclaration.statusCode);
            return true;
        });

        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock([
                ...deduplicatedErrors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    return ts.factory.createCaseClause(
                        ts.factory.createNumericLiteral(errorDeclaration.statusCode),
                        generateCaseBody(error)
                    );
                }),
                ts.factory.createDefaultClause(defaultBody)
            ])
        );
    }

    private getThrowsForNonStatusCodeErrors(context: FileContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToRawResponse = this.getReferenceToRawResponse(context);

        const handleNonStatusCodeErrorReference =
            context.nonStatusCodeErrorHandler.getReferenceToHandleNonStatusCodeError({
                importsManager: context.importsManager,
                exportsManager: context.exportsManager,
                sourceFile: context.sourceFile
            });

        return [
            ts.factory.createReturnStatement(
                ts.factory.createCallExpression(handleNonStatusCodeErrorReference.getExpression(), undefined, [
                    referenceToError,
                    referenceToRawResponse,
                    ts.factory.createStringLiteral(this.endpoint.method),
                    ts.factory.createStringLiteral(getFullPathForEndpoint(this.endpoint))
                ])
            )
        ];
    }

    private getGeneratedEndpointTypeSchemas(context: FileContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getReturnStatementsForOkResponse(context: FileContext): ts.Statement[] {
        if (this.endpoint.response?.body != null) {
            return this.getReturnStatementsForOkResponseBody(context);
        }

        const dataInitializer =
            this.endpoint.method === FernIr.HttpMethod.Head
                ? ts.factory.createPropertyAccessExpression(
                      ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                          ts.factory.createIdentifier("rawResponse")
                      ),
                      "headers"
                  )
                : ts.factory.createIdentifier("undefined");

        return [
            ts.factory.createReturnStatement(
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(ts.factory.createIdentifier("data"), dataInitializer),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("rawResponse"),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                                ts.factory.createIdentifier("rawResponse")
                            )
                        )
                    ],
                    false
                )
            )
        ];
    }

    private getReferenceToError(context: FileContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: FileContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }

    private getEventDiscriminator(
        payload: FernIr.TypeReference,
        context: FileContext
    ): { eventDiscriminator: ts.Expression } | Record<string, never> {
        if (payload.type !== "named") {
            return {};
        }
        const typeDeclaration = context.type.getTypeDeclaration(payload);
        if (typeDeclaration.shape.type !== "union") {
            return {};
        }
        if (typeDeclaration.shape.discriminatorContext !== FernIr.UnionDiscriminatorContext.Protocol) {
            return {};
        }
        return {
            eventDiscriminator: ts.factory.createStringLiteral(getWireValue(typeDeclaration.shape.discriminant))
        };
    }
}
