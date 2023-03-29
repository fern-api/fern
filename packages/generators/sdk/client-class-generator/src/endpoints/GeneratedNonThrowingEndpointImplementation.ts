import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpRequestBody, HttpService, PathParameter, SdkRequestShape } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { Fetcher, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import {
    GeneratedEndpointErrorUnion,
    GeneratedSdkEndpointTypeSchemas,
    SdkClientClassContext,
} from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedHeader } from "../GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { RequestBodyParameter } from "../request-parameter/RequestBodyParameter";
import { RequestParameter } from "../request-parameter/RequestParameter";
import { RequestWrapperParameter } from "../request-parameter/RequestWrapperParameter";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";
import { getParameterNameForPathParameter } from "./utils/getParameterNameForPathParameter";

export declare namespace GeneratedNonThrowingEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class GeneratedNonThrowingEndpointImplementation implements GeneratedEndpointImplementation {
    private static RESPONSE_VARIABLE_NAME = "_response";
    private static QUERY_PARAMS_VARIABLE_NAME = "_queryParams";

    public readonly endpoint: HttpEndpoint;
    private packageId: PackageId;
    private service: HttpService;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private requestParameter: RequestParameter | undefined;
    private requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private errorResolver: ErrorResolver;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;

    constructor({
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        errorDiscriminationStrategy,
        errorResolver,
    }: GeneratedNonThrowingEndpointImplementation.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.errorResolver = errorResolver;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.requestBody = requestBody;

        const sdkRequest = this.endpoint.sdkRequest;
        this.requestParameter =
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

    public getDocs(): string | undefined {
        return this.endpoint.docs ?? undefined;
    }

    private getEndpointParameters(
        context: SdkClientClassContext,
        {
            requestParameterIntersection,
            excludeInitializers,
        }: { requestParameterIntersection: ts.TypeNode | undefined; excludeInitializers: boolean }
    ): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        for (const pathParameter of this.getAllPathParameters()) {
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

    private getAllPathParameters(): PathParameter[] {
        return [...this.service.pathParameters, ...this.endpoint.pathParameters];
    }

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(...this.requestParameter.getInitialStatements(context));
            const queryParameters = this.requestParameter.getAllQueryParameters(context);
            if (queryParameters.length > 0) {
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    GeneratedNonThrowingEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME,
                                    undefined,
                                    undefined,
                                    ts.factory.createNewExpression(
                                        ts.factory.createIdentifier("URLSearchParams"),
                                        undefined,
                                        []
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );
                for (const queryParameter of queryParameters) {
                    statements.push(
                        ...this.requestParameter.withQueryParameter(
                            queryParameter,
                            context,
                            (referenceToQueryParameter) => {
                                return [
                                    ts.factory.createExpressionStatement(
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(
                                                    GeneratedNonThrowingEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME
                                                ),
                                                ts.factory.createIdentifier("append")
                                            ),
                                            undefined,
                                            [
                                                ts.factory.createStringLiteral(queryParameter.name.wireValue),
                                                context.type.stringify(
                                                    referenceToQueryParameter,
                                                    queryParameter.valueType
                                                ),
                                            ]
                                        )
                                    ),
                                ];
                            }
                        )
                    );
                }
            }
        }

        statements.push(...this.invokeFetcherAndReturnResponse(context));

        return statements;
    }

    public invokeFetcherAndReturnResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.invokeFetcher(context), ...this.getReturnResponseStatements(context)];
    }

    private getReferenceToEnvironment(context: SdkClientClassContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(context);
        const url = buildUrl({ endpoint: this.endpoint, generatedClientClass: this.generatedSdkClientClass, context });
        if (url != null) {
            return context.base.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    private getHeaders(context: SdkClientClassContext): ts.ObjectLiteralElementLike[] {
        const elements: GeneratedHeader[] = [];

        const authorizationHederValue = this.generatedSdkClientClass.getAuthorizationHeaderValue();
        if (authorizationHederValue != null) {
            elements.push({
                header: "Authorization",
                value: authorizationHederValue,
            });
        }

        elements.push(...this.generatedSdkClientClass.getApiHeaders(context));

        if (this.requestParameter != null) {
            for (const header of this.requestParameter.getAllHeaders(context)) {
                elements.push({
                    header: header.name.wireValue,
                    value: this.requestParameter.getReferenceToHeader(header, context),
                });
            }
        }

        return elements.map(({ header, value }) =>
            ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
        );
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
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock([ts.factory.createReturnStatement(this.getReturnValueForOkResponse(context))], true)
        );
    }

    private getOkResponseBody(context: SdkClientClassContext): ts.Expression {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME),
                context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
    }

    private getReferenceToError(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedNonThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME),
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
            queryParameters:
                this.endpoint.queryParameters.length > 0
                    ? ts.factory.createIdentifier(GeneratedNonThrowingEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME)
                    : undefined,
            body: this.getSerializedRequestBody(context),
            timeoutMs: undefined,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            contentType: "application/json",
        };

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedNonThrowingEndpointImplementation.RESPONSE_VARIABLE_NAME,
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

    private getReturnFailedResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.getReturnResponseForKnownErrors(context), this.getReturnResponseForUnknownError(context)];
    }

    private getReturnValueForOkResponse(context: SdkClientClassContext): ts.Expression | undefined {
        return context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse._build(
            this.endpoint.response != null ? this.getOkResponseBody(context) : ts.factory.createIdentifier("undefined")
        );
    }

    private getReturnResponseForKnownErrors(context: SdkClientClassContext): ts.Statement[] {
        if (this.endpoint.errors.length === 0) {
            return [];
        }

        const referenceToError = this.getReferenceToError(context);

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
                ts.factory.createBlock([this.getSwitchStatementForErrors(context)], true)
            ),
        ];
    }

    private getSwitchStatementForErrors(context: SdkClientClassContext) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy,
                }),
            statusCode: () => this.getSwitchStatementForStatusCodeDiscriminatedErrors(context),
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
    }: {
        context: SdkClientClassContext;
        propertyErrorDiscriminationStrategy: ErrorDiscriminationByPropertyStrategy;
    }) {
        if (this.endpoint.errors.length === 0) {
            throw new Error("Cannot generate switch because there are no errors defined");
        }

        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);

        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessChain(
                ts.factory.createAsExpression(
                    referenceToErrorBody,
                    generatedEndpointTypeSchemas.getReferenceToRawError(context)
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                propertyErrorDiscriminationStrategy.discriminant.wireValue
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error, index) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.sdkError.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        index < this.endpoint.errors.length - 1
                            ? []
                            : [
                                  ts.factory.createReturnStatement(
                                      context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                          generatedEndpointTypeSchemas.deserializeError(
                                              ts.factory.createAsExpression(
                                                  referenceToErrorBody,
                                                  generatedEndpointTypeSchemas.getReferenceToRawError(context)
                                              ),
                                              context
                                          )
                                      )
                                  ),
                              ]
                    )
                ),
            ])
        );
    }

    private getGeneratedEndpointTypeSchemas(context: SdkClientClassContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors(context: SdkClientClassContext) {
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock(
                this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(error.error);
                    return ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                        ts.factory.createReturnStatement(
                            context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                context.endpointErrorUnion
                                    .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                                    .getErrorUnion()
                                    .buildWithBuilder({
                                        discriminantValueToBuild: errorDeclaration.statusCode,
                                        builderArgument:
                                            generatedSdkErrorSchema != null
                                                ? generatedSdkErrorSchema.deserializeBody(context, {
                                                      referenceToBody: this.getReferenceToErrorBody(context),
                                                  })
                                                : undefined,
                                        context,
                                    })
                            )
                        ),
                    ]);
                })
            )
        );
    }

    private getReturnResponseForUnknownError(context: SdkClientClassContext): ts.Statement {
        return ts.factory.createReturnStatement(
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                this.getGeneratedEndpointErrorUnion(context)
                    .getErrorUnion()
                    .buildUnknown({
                        existingValue: this.getReferenceToError(context),
                        context,
                    })
            )
        );
    }

    private getResponseType(context: SdkClientClassContext): ts.TypeNode {
        return context.base.coreUtilities.fetcher.APIResponse._getReferenceToType(
            this.endpoint.response != null
                ? context.type.getReferenceToType(this.endpoint.response.responseBodyType).typeNode
                : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            context.endpointErrorUnion
                .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                .getErrorUnion()
                .getReferenceTo(context)
        );
    }

    private getGeneratedEndpointErrorUnion(context: SdkClientClassContext): GeneratedEndpointErrorUnion {
        return context.endpointErrorUnion.getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name);
    }
}
