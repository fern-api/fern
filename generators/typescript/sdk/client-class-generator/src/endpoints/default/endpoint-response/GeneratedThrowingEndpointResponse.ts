import { PackageId, StreamingFetcher, getFullPathForEndpoint, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

import {
    ContainerType,
    CursorPagination,
    ErrorDiscriminationByPropertyStrategy,
    ErrorDiscriminationStrategy,
    HttpEndpoint,
    HttpResponseBody,
    Name,
    NameAndWireValue,
    OffsetPagination,
    PrimitiveTypeV2,
    ResponseError,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { GeneratedSdkClientClassImpl } from "../../../GeneratedSdkClientClassImpl";
import { GeneratedStreamingEndpointImplementation } from "../../GeneratedStreamingEndpointImplementation";
import { getAbortSignalExpression } from "../../utils/requestOptionsParameter";
import { GeneratedEndpointResponse, PaginationResponseInfo } from "./GeneratedEndpointResponse";
import {
    CONTENT_LENGTH_RESPONSE_KEY,
    CONTENT_LENGTH_VARIABLE_NAME,
    CONTENT_TYPE_RESPONSE_KEY,
    READABLE_RESPONSE_KEY,
    getSuccessReturnType
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
            | undefined;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
        includeContentHeadersOnResponse: boolean;
        clientClass: GeneratedSdkClientClassImpl;
    }
}

export class GeneratedThrowingEndpointResponse implements GeneratedEndpointResponse {
    private static RESPONSE_VARIABLE_NAME = "_response";

    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private response:
        | HttpResponseBody.Json
        | HttpResponseBody.FileDownload
        | HttpResponseBody.Streaming
        | HttpResponseBody.Text
        | undefined;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private errorResolver: ErrorResolver;
    private includeContentHeadersOnResponse: boolean;
    private clientClass: GeneratedSdkClientClassImpl;

    constructor({
        packageId,
        endpoint,
        response,
        errorDiscriminationStrategy,
        errorResolver,
        includeContentHeadersOnResponse,
        clientClass
    }: GeneratedThrowingEndpointResponse.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.response = response;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.errorResolver = errorResolver;
        this.includeContentHeadersOnResponse = includeContentHeadersOnResponse;
        this.clientClass = clientClass;
    }

    private getItemTypeFromListOrOptionalList(typeReference: TypeReference): TypeReference | undefined {
        if (typeReference.type === "container" && typeReference.container.type === "list") {
            return typeReference.container.list;
        }
        if (typeReference.type === "container" && typeReference.container.type === "optional") {
            return this.getItemTypeFromListOrOptionalList(typeReference.container.optional);
        }
        return undefined;
    }

    public getPaginationInfo(context: SdkContext): PaginationResponseInfo | undefined {
        const successReturnType = getSuccessReturnType(this.response, context, {
            includeContentHeadersOnResponse: this.includeContentHeadersOnResponse
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

        const itemType = context.type.getReferenceToType(itemTypeReference).typeNode;

        // hasNextPage checks if next property is not null
        const nextProperty = this.getNameFromWireValue({ name: cursor.next.property.name, context });
        const nextPropertyPath = [
            "response",
            ...(cursor.next.propertyPath ?? []).map((name) => this.getName({ name, context }))
        ].join("?.");
        const nextPropertyAccess = ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(nextPropertyPath),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(nextProperty)
        );
        const hasNextPage = ts.factory.createBinaryExpression(
            nextPropertyAccess,
            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            ts.factory.createNull()
        );

        // getItems gets the items
        const itemsProperty = this.getNameFromWireValue({ name: cursor.results.property.name, context });
        const itemsPropertyPath = [
            "response",
            ...(cursor.results.propertyPath ?? []).map((name) => this.getName({ name, context }))
        ].join("?.");
        const getItems = ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(itemsPropertyPath),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier(itemsProperty)
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createArrayLiteralExpression([], false)
        );

        // loadPage
        const pageProperty = this.getNameFromWireValue({ name: cursor.page.property.name, context });
        const pagePropertyPathForSet = [
            ...(cursor.page.propertyPath ?? []).map((name) => this.getName({ name, context })),
            pageProperty
        ].join(".");
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
            itemType,
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

        const itemType = context.type.getReferenceToType(itemTypeReference).typeNode;

        // initializeOffset uses the offset property if set
        const pageProperty = this.getNameFromWireValue({ name: offset.page.property.name, context });
        const pagePropertyDefault = this.getDefaultPaginationValue({ type: offset.page.property.valueType });
        const pagePropertyPath = [
            "request",
            ...(offset.page.propertyPath ?? []).map((name) => this.getName({ name, context }))
        ].join("?.");
        const pagePropertyPathForSet = [
            ...(offset.page.propertyPath ?? []).map((name) => this.getName({ name, context })),
            pageProperty
        ].join(".");
        const pagePropertyAccess = ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(pagePropertyPath),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(pageProperty)
        );
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

        // hasNextPage checks if the items are not empty
        const itemsProperty = this.getNameFromWireValue({ name: offset.results.property.name, context });
        const itemsPropertyPathComponents = [
            "response",
            ...(offset.results.propertyPath ?? []).map((name) => this.getName({ name, context }))
        ];
        const itemsPropertyPath = itemsPropertyPathComponents.join("?.");
        const itemsPropertyPathWithoutOptional = itemsPropertyPathComponents.join(".");
        const itemsPropertyAccess = ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(itemsPropertyPath),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(itemsProperty)
        );
        let hasNextPage: ts.Expression = ts.factory.createBinaryExpression(
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
        if (offset.hasNextPage != null) {
            const hasNextPagePropertyComponents = [
                "response",
                ...(offset.hasNextPage.propertyPath ?? []).map((name) => this.getName({ name, context }))
            ];
            const hasNextPageProperty = this.getNameFromWireValue({ name: offset.hasNextPage.property.name, context });
            const hasNextPagePropertyAccess = ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(hasNextPagePropertyComponents.join("?.")),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier(hasNextPageProperty)
            );
            hasNextPage = ts.factory.createBinaryExpression(
                hasNextPagePropertyAccess,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                hasNextPage
            );
        }

        // getItems gets the items
        const getItems = ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(itemsPropertyPath),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier(itemsProperty)
            ),
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
                                  ts.factory.createPropertyAccessExpression(
                                      ts.factory.createIdentifier(itemsPropertyPathWithoutOptional),
                                      ts.factory.createIdentifier(itemsProperty)
                                  ),
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
            itemType,
            responseType: successReturnType,
            hasNextPage,
            getItems,
            loadPage
        };
    }

    private getName({ name, context }: { name: Name; context: SdkContext }): string {
        return context.retainOriginalCasing || !context.includeSerdeLayer ? name.originalName : name.camelCase.safeName;
    }

    private getNameFromWireValue({ name, context }: { name: NameAndWireValue; context: SdkContext }): string {
        return context.retainOriginalCasing || !context.includeSerdeLayer
            ? name.wireValue
            : name.name.camelCase.safeName;
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
                    optional: (optType) => this.getDefaultPaginationValue({ type: optType }),
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
        return getSuccessReturnType(this.response, context, {
            includeContentHeadersOnResponse: this.includeContentHeadersOnResponse
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
                                    ts.factory.createCallExpression(ts.factory.createIdentifier("Number"), undefined, [
                                        ts.factory.createIdentifier(CONTENT_LENGTH_VARIABLE_NAME)
                                    ]),
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
                )
            ];
        } else if (this.response?.type === "streaming") {
            const eventShape = this.response.value._visit<
                StreamingFetcher.MessageEventShape | StreamingFetcher.SSEEventShape
            >({
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
                    context.coreUtilities.streamUtils.Stream._construct({
                        stream: ts.factory.createPropertyAccessChain(
                            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                            undefined,
                            ts.factory.createIdentifier(
                                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                            )
                        ),
                        eventShape,
                        signal: getAbortSignalExpression({
                            abortSignalReference: this.clientClass.getReferenceToAbortSignal.bind(this.clientClass)
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
                                                  .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
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
        return [ts.factory.createReturnStatement(deserializeToResponse)];
    }

    private getSuccessResponse(body: ts.Expression): ts.ReturnStatement {
        return ts.factory.createReturnStatement(
            ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier("ok"),
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                            ts.factory.createIdentifier("ok")
                        )
                    ),
                    ts.factory.createPropertyAssignment(ts.factory.createIdentifier("body"), body),
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier("headers"),
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                            ts.factory.createIdentifier("headers")
                        )
                    )
                ],
                true
            )
        );
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

    private getReturnFailedResponse(context: SdkContext): ts.Statement[] {
        return [...this.getThrowsForStatusCodeErrors(context), ...this.getThrowsForNonStatusCodeErrors(context)];
    }

    private getThrowsForStatusCodeErrors(context: SdkContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);

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
                )
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
                                                          : undefined
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
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) => {
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

    private getThrowsForNonStatusCodeErrors(context: SdkContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        return [
            ts.factory.createSwitchStatement(
                ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.coreUtilities.fetcher.Fetcher.Error.reason
                ),
                ts.factory.createCaseBlock([
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.coreUtilities.fetcher.Fetcher.NonJsonError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: undefined,
                                    statusCode: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.coreUtilities.fetcher.Fetcher.NonJsonError.statusCode
                                    ),
                                    responseBody: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.coreUtilities.fetcher.Fetcher.NonJsonError.rawBody
                                    )
                                })
                            )
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.coreUtilities.fetcher.Fetcher.TimeoutSdkError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.timeoutSdkError
                                    .getGeneratedTimeoutSdkError()
                                    .build(
                                        context,
                                        `Timeout exceeded when calling ${this.endpoint.method} ${getFullPathForEndpoint(
                                            this.endpoint
                                        )}.`
                                    )
                            )
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.coreUtilities.fetcher.Fetcher.UnknownError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.coreUtilities.fetcher.Fetcher.UnknownError.message
                                    ),
                                    statusCode: undefined,
                                    responseBody: undefined
                                })
                            )
                        ]
                    )
                ])
            )
        ];
    }

    private getGeneratedEndpointTypeSchemas(context: SdkContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getReturnStatementsForOkResponse(context: SdkContext): ts.Statement[] {
        return this.endpoint.response?.body != null
            ? this.getReturnStatementsForOkResponseBody(context)
            : [ts.factory.createReturnStatement(undefined)];
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
