import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpRequestBody, HttpService, ResponseError, SdkRequestShape } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { Fetcher, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkClientClassContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { RequestBodyParameter } from "../request-parameter/RequestBodyParameter";
import { RequestParameter } from "../request-parameter/RequestParameter";
import { RequestWrapperParameter } from "../request-parameter/RequestWrapperParameter";
import { EndpointSignature } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";
import { GeneratedQueryParams } from "./utils/GeneratedQueryParams";
import { generateHeaders } from "./utils/generateHeaders";
import { getParameterNameForPathParameter } from "./utils/getParameterNameForPathParameter";
import { getPathParametersForEndpointSignature } from "./utils/getPathParametersForEndpointSignature";

export declare namespace GeneratedThrowingEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        timeoutInSeconds: number | "infinity" | undefined;
    }
}

export class GeneratedThrowingEndpointImplementation implements GeneratedThrowingEndpointImplementation {
    private static RESPONSE_VARIABLE_NAME = "_response";

    public readonly endpoint: HttpEndpoint;
    private packageId: PackageId;
    private service: HttpService;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private requestParameter: RequestParameter | undefined;
    private queryParams: GeneratedQueryParams;
    private requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private errorResolver: ErrorResolver;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private timeoutInSeconds: number | "infinity" | undefined;

    constructor({
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        errorDiscriminationStrategy,
        errorResolver,
        timeoutInSeconds,
    }: GeneratedThrowingEndpointImplementation.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.errorResolver = errorResolver;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.requestBody = requestBody;
        this.timeoutInSeconds = timeoutInSeconds;

        const sdkRequest = this.endpoint.sdkRequest;
        const requestParameter =
            sdkRequest != null
                ? SdkRequestShape._visit<RequestParameter>(sdkRequest.shape, {
                      justRequestBody: (requestBodyReference) =>
                          new RequestBodyParameter({ packageId, requestBodyReference, service, endpoint, sdkRequest }),
                      wrapper: () => new RequestWrapperParameter({ packageId, service, endpoint, sdkRequest }),
                      _unknown: () => {
                          throw new Error("Unknown SdkRequest: " + this.endpoint.sdkRequest?.shape.type);
                      },
                  })
                : undefined;

        this.requestParameter = requestParameter;
        this.queryParams = new GeneratedQueryParams({
            requestParameter,
        });
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(
        context: SdkClientClassContext,
        {
            requestParameterIntersection,
            excludeInitializers = false,
        }: { requestParameterIntersection?: ts.TypeNode; excludeInitializers?: boolean } = {}
    ): EndpointSignature {
        return {
            parameters: this.getEndpointParameters(context, { requestParameterIntersection, excludeInitializers }),
            returnTypeWithoutPromise: this.getResponseType(context),
        };
    }

    public getDocs(context: SdkClientClassContext): string | undefined {
        const lines: string[] = [];
        if (this.endpoint.docs != null) {
            lines.push(this.endpoint.docs);
        }

        for (const error of this.endpoint.errors) {
            const referenceToError = context.sdkError
                .getReferenceToError(error.error)
                .getExpression({ isForComment: true });
            lines.push(`@throws {${getTextOfTsNode(referenceToError)}}`);
        }

        if (lines.length === 0) {
            return undefined;
        }

        return lines.join("\n");
    }

    private getEndpointParameters(
        context: SdkClientClassContext,
        {
            requestParameterIntersection,
            excludeInitializers,
        }: { requestParameterIntersection: ts.TypeNode | undefined; excludeInitializers: boolean }
    ): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature(this.service, this.endpoint)) {
            parameters.push({
                name: getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
            });
        }
        if (this.requestParameter != null) {
            parameters.push(
                this.requestParameter.getParameterDeclaration(context, {
                    typeIntersection: requestParameterIntersection,
                    excludeInitializers,
                })
            );
        }
        return parameters;
    }

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(...this.requestParameter.getInitialStatements(context));
        }

        statements.push(...this.queryParams.getBuildStatements(context));
        statements.push(...this.invokeFetcherAndReturnResponse(context));

        return statements;
    }

    public invokeFetcherAndReturnResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.invokeFetcher(context), ...this.getReturnResponseStatements(context)];
    }
    private getReferenceToEnvironment(context: SdkClientClassContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(this.endpoint, context);
        const url = buildUrl({ endpoint: this.endpoint, generatedClientClass: this.generatedSdkClientClass, context });
        if (url != null) {
            return context.base.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    private getHeaders(context: SdkClientClassContext): ts.ObjectLiteralElementLike[] {
        return generateHeaders({
            context,
            requestParameter: this.requestParameter,
            generatedSdkClientClass: this.generatedSdkClientClass,
            service: this.service,
            endpoint: this.endpoint,
        });
    }

    private getSerializedRequestBody(context: SdkClientClassContext): ts.Expression | undefined {
        if (this.requestParameter == null || this.requestBody == null) {
            return undefined;
        }
        const referenceToRequestBody = this.requestParameter.getReferenceToRequestBody(context);
        if (referenceToRequestBody == null) {
            return undefined;
        }

        switch (this.requestBody.type) {
            case "inlinedRequestBody":
                return context.sdkInlinedRequestBodySchema
                    .getGeneratedInlinedRequestBodySchema(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            case "reference":
                return context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            default:
                assertNever(this.requestBody);
        }
    }

    private getReturnResponseStatements(context: SdkClientClassContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: SdkClientClassContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock([ts.factory.createReturnStatement(this.getReturnValueForOkResponse(context))], true)
        );
    }

    private getOkResponseBody(context: SdkClientClassContext): ts.Expression {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME),
                context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
    }

    private getReferenceToError(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME),
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }

    private invokeFetcher(context: SdkClientClassContext): ts.Statement[] {
        const fetcherArgs: Fetcher.Args = {
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            headers: this.getHeaders(context),
            queryParameters: this.queryParams.getReferenceTo(context),
            body: this.getSerializedRequestBody(context),
            timeoutInSeconds: this.timeoutInSeconds,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            contentType: "application/json",
        };

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.base.coreUtilities.fetcher.fetcher._invoke(fetcherArgs, {
                                referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(context),
                            })
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
        ];
    }

    private getResponseType(context: SdkClientClassContext): ts.TypeNode {
        return this.endpoint.response != null
            ? context.type.getReferenceToType(this.endpoint.response.responseBodyType).typeNode
            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }

    private getReturnFailedResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.getThrowsForStatusCodeErrors(context), ...this.getThrowsForNonStatusCodeErrors(context)];
    }

    private getThrowsForStatusCodeErrors(context: SdkClientClassContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);

        const defaultThrow = ts.factory.createThrowStatement(
            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                message: undefined,
                statusCode: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
                ),
                responseBody: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
                ),
            })
        );

        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        referenceToError,
                        context.base.coreUtilities.fetcher.Fetcher.Error.reason
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral(
                        context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError._reasonLiteralValue
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
                                                                referenceToBody: referenceToErrorBody,
                                                            })
                                                          : undefined,
                                              })
                                          ),
                                      ];
                                  },
                                  defaultBody: [defaultThrow],
                              })
                            : defaultThrow,
                    ],
                    true
                )
            ),
        ];
    }

    private getSwitchStatementForErrors({
        context,
        generateCaseBody,
        defaultBody,
    }: {
        context: SdkClientClassContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy,
                    generateCaseBody,
                    defaultBody,
                }),
            statusCode: () =>
                this.getSwitchStatementForStatusCodeDiscriminatedErrors({
                    context,
                    generateCaseBody,
                    defaultBody,
                }),
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
        generateCaseBody,
        defaultBody,
    }: {
        context: SdkClientClassContext;
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
                ts.factory.createDefaultClause(defaultBody),
            ])
        );
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors({
        context,
        generateCaseBody,
        defaultBody,
    }: {
        context: SdkClientClassContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    return ts.factory.createCaseClause(
                        ts.factory.createNumericLiteral(errorDeclaration.statusCode),
                        generateCaseBody(error)
                    );
                }),
                ts.factory.createDefaultClause(defaultBody),
            ])
        );
    }

    private getThrowsForNonStatusCodeErrors(context: SdkClientClassContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        return [
            ts.factory.createSwitchStatement(
                ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.Error.reason
                ),
                ts.factory.createCaseBlock([
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.NonJsonError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: undefined,
                                    statusCode: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.NonJsonError.statusCode
                                    ),
                                    responseBody: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.NonJsonError.rawBody
                                    ),
                                })
                            ),
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.TimeoutSdkError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.timeoutSdkError.getGeneratedTimeoutSdkError().build(context)
                            ),
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.UnknownError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.UnknownError.message
                                    ),
                                    statusCode: undefined,
                                    responseBody: undefined,
                                })
                            ),
                        ]
                    ),
                ])
            ),
        ];
    }

    private getGeneratedEndpointTypeSchemas(context: SdkClientClassContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getReturnValueForOkResponse(context: SdkClientClassContext): ts.Expression | undefined {
        return this.endpoint.response != null ? this.getOkResponseBody(context) : undefined;
    }
}
