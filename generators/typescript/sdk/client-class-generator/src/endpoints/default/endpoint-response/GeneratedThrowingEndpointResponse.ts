import {
    ContainerType,
    CursorPagination,
    ErrorDiscriminationByPropertyStrategy,
    ErrorDiscriminationStrategy,
    HttpEndpoint,
    HttpMethod,
    HttpResponseBody,
    OffsetPagination,
    PrimitiveTypeV2,
    ResponseError,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import {
    getElementTypeFromArrayType,
    getFullPathForEndpoint,
    getTextOfTsNode,
    PackageId,
    removeUndefinedAndNullFromTypeNode,
    Stream
} from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "../../../GeneratedSdkClientClassImpl";
import { GeneratedStreamingEndpointImplementation } from "../../GeneratedStreamingEndpointImplementation";
import { getAbortSignalExpression } from "../../utils/requestOptionsParameter";
import { GeneratedEndpointResponse, PaginationResponseInfo } from "./GeneratedEndpointResponse";
import {
    CONTENT_LENGTH_RESPONSE_KEY,
    CONTENT_LENGTH_VARIABLE_NAME,
    CONTENT_TYPE_RESPONSE_KEY,
    getSuccessReturnType,
    READABLE_RESPONSE_KEY
} from "./getSuccessReturnType";

export declare namespace GeneratedThrowingEndpointResponse {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        response:
            | HttpResponseBody.Json
            | HttpResponseBody.FileDownload
            | HttpResponseBody.Streaming
            | HttpResponseBody.Text
            | HttpResponseBody.Bytes
            | undefined;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
        includeContentHeadersOnResponse: boolean;
        clientClass: GeneratedSdkClientClassImpl;
        streamType: "wrapper" | "web";
        fileResponseType: "stream" | "binary-response";
    }
}

export class GeneratedThrowingEndpointResponse implements GeneratedEndpointResponse {
    public static readonly RESPONSE_VARIABLE_NAME = "_response";

    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private response:
        | HttpResponseBody.Json
        | HttpResponseBody.FileDownload
        | HttpResponseBody.Streaming
        | HttpResponseBody.Text
        | HttpResponseBody.Bytes
        | undefined;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private errorResolver: ErrorResolver;
    private includeContentHeadersOnResponse: boolean;
    private clientClass: GeneratedSdkClientClassImpl;
    private streamType: "wrapper" | "web";
    private readonly fileResponseType: "stream" | "binary-response";

    constructor({
        packageId,
        endpoint,
        response,
        errorDiscriminationStrategy,
        errorResolver,
        includeContentHeadersOnResponse,
        clientClass,
        streamType,
        fileResponseType
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
    }

    private getItemTypeFromListOrOptionalList(typeReference: TypeReference): TypeReference | undefined {
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

    public getPaginationInfo(context: SdkContext): PaginationResponseInfo | undefined {
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
            }
        }

        return undefined;
    }

    private getCursorPaginationInfo({
        context,
        cursor,
        successReturnType
    }: {
        context: SdkContext;
        cursor: CursorPagination;
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
        context: SdkContext;
        offset: OffsetPagination;
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
                          ts.factory.createParenthesizedExpression(
                              ts.factory.createBinaryExpression(
                                  stepPropertyAccess,
                                  ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                  ts.factory.createNumericLiteral("1")
                              )
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
            offset.step != null
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
            type: offset.step != null ? "offset-step" : "offset",
            initializeOffset,
            itemType: itemType,
            responseType: successReturnType,
            hasNextPage,
            getItems,
            loadPage
        };
    }

    private getDefaultPaginationValue({ type }: { type: TypeReference }): string {
        let defaultValue: string | undefined;

        TypeReference._visit(type, {
            primitive: (primitiveType) => {
                const maybeV2Scheme = primitiveType.v2;
                if (maybeV2Scheme != null) {
                    defaultValue = PrimitiveTypeV2._visit(maybeV2Scheme, {
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
                        uuid: () => undefined,
                        base64: () => undefined,
                        float: () => undefined,
                        _other: () => undefined
                    });
                }
            },
            container: (containerType) => {
                defaultValue = ContainerType._visit(containerType, {
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

    public getNamesOfThrownExceptions(context: SdkContext): string[] {
        return this.endpoint.errors.map((error) =>
            getTextOfTsNode(context.sdkError.getReferenceToError(error.error).getExpression())
        );
    }

    public getReturnType(context: SdkContext): ts.TypeNode {
        return getSuccessReturnType(this.endpoint, this.response, context, {
            includeContentHeadersOnResponse: this.includeContentHeadersOnResponse,
            streamType: this.streamType,
            fileResponseType: this.fileResponseType
        });
    }

    public getReturnResponseStatements(context: SdkContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: SdkContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock(this.getReturnStatementsForOkResponse(context), true)
        );
    }

    private getReturnStatementsForOkResponseBody(context: SdkContext): ts.Statement[] {
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
                    type: "sse",
                    streamTerminator: ts.factory.createStringLiteral(sse.terminator ?? "[DONE]")
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

    private getReferenceToResponseHeaders(context: SdkContext): ts.Expression {
        return ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier(context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.headers)
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createObjectLiteralExpression([], false)
        );
    }

    private getReferenceToRawResponse(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            ts.factory.createIdentifier(context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.rawResponse)
        );
    }

    private getReturnFailedResponse(context: SdkContext): ts.Statement[] {
        return [...this.getThrowsForStatusCodeErrors(context), this.getThrowsForNonStatusCodeErrors(context)];
    }

    private getThrowsForStatusCodeErrors(context: SdkContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);
        const referenceToRawResponse = this.getReferenceToRawResponse(context);

        const handleGlobalStatusCodeErrorReference = context.baseClient.getReferenceToHandleGlobalStatusCodeError({
            importsManager: context.importsManager,
            exportsManager: context.exportsManager,
            sourceFile: context.sourceFile
        });

        const globalStatusCodeErrorThrow = ts.factory.createReturnStatement(
            ts.factory.createCallExpression(handleGlobalStatusCodeErrorReference.getExpression(), undefined, [
                referenceToError,
                referenceToRawResponse
            ])
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
                                  defaultBody: [globalStatusCodeErrorThrow]
                              })
                            : globalStatusCodeErrorThrow
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
        context: SdkContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
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
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
        generateCaseBody,
        defaultBody
    }: {
        context: SdkContext;
        propertyErrorDiscriminationStrategy: ErrorDiscriminationByPropertyStrategy;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createElementAccessChain(
                ts.factory.createAsExpression(
                    this.getReferenceToErrorBody(context),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createStringLiteral(propertyErrorDiscriminationStrategy.discriminant.wireValue)
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.sdkError.getErrorDeclaration(error.error).discriminantValue.wireValue
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
        context: SdkContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        const seenStatusCodes = new Set<number>();
        const uniqueErrors = this.endpoint.errors.filter((error) => {
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
                ...uniqueErrors.map((error) => {
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

    private getThrowsForNonStatusCodeErrors(context: SdkContext): ts.Statement {
        const referenceToError = this.getReferenceToError(context);
        const referenceToRawResponse = this.getReferenceToRawResponse(context);

        const handleNonStatusCodeErrorReference = context.baseClient.getReferenceToHandleNonStatusCodeError({
            importsManager: context.importsManager,
            exportsManager: context.exportsManager,
            sourceFile: context.sourceFile
        });

        return ts.factory.createReturnStatement(
            ts.factory.createCallExpression(handleNonStatusCodeErrorReference.getExpression(), undefined, [
                referenceToError,
                referenceToRawResponse,
                ts.factory.createStringLiteral(this.endpoint.method),
                ts.factory.createStringLiteral(getFullPathForEndpoint(this.endpoint))
            ])
        );
    }

    private getGeneratedEndpointTypeSchemas(context: SdkContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getReturnStatementsForOkResponse(context: SdkContext): ts.Statement[] {
        if (this.endpoint.response?.body != null) {
            return this.getReturnStatementsForOkResponseBody(context);
        }

        const dataInitializer =
            this.endpoint.method === HttpMethod.Head
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

    private getReferenceToError(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }
}
