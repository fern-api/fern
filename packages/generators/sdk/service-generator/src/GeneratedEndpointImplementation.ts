import { HttpEndpoint, HttpPath, HttpService, PathParameter, SdkRequestShape } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    Fetcher,
    GeneratedEndpointTypes,
    GeneratedEndpointTypeSchemas,
    ServiceContext,
} from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import {
    MethodDeclarationStructure,
    OptionalKind,
    ParameterDeclarationStructure,
    Scope,
    StatementStructures,
    StructureKind,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import urlJoin from "url-join";
import { GeneratedHeader } from "./GeneratedHeader";
import { GeneratedServiceImpl } from "./GeneratedServiceImpl";
import { RequestBodyParameter } from "./request-parameter/RequestBodyParameter";
import { RequestParameter } from "./request-parameter/RequestParameter";
import { RequestWrapperParameter } from "./request-parameter/RequestWrapperParameter";

export declare namespace GeneratedEndpointImplementation {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        generatedService: GeneratedServiceImpl;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class GeneratedEndpointImplementation {
    // these start with an underscore to prevent collisions with path parameters
    private static RESPONSE_VARIABLE_NAME = "_response";
    private static QUERY_PARAMS_VARIABLE_NAME = "_queryParams";

    private service: HttpService;
    private endpoint: HttpEndpoint;
    private generatedService: GeneratedServiceImpl;
    private errorResolver: ErrorResolver;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private requestParameter: RequestParameter | undefined;

    constructor({
        service,
        endpoint,
        generatedService,
        errorResolver,
        errorDiscriminationStrategy,
    }: GeneratedEndpointImplementation.Init) {
        this.service = service;
        this.endpoint = endpoint;
        this.generatedService = generatedService;
        this.errorResolver = errorResolver;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;

        const sdkRequest = this.endpoint.sdkRequest;
        this.requestParameter =
            sdkRequest != null
                ? SdkRequestShape._visit<RequestParameter>(sdkRequest.shape, {
                      justRequestBody: (requestBodyReference) =>
                          new RequestBodyParameter({ requestBodyReference, service, endpoint, sdkRequest }),
                      wrapper: () => new RequestWrapperParameter({ service, endpoint, sdkRequest }),
                      _unknown: () => {
                          throw new Error("Unknown SdkRequest: " + this.endpoint.sdkRequest?.shape.type);
                      },
                  })
                : undefined;
    }

    public getImplementation(context: ServiceContext): OptionalKind<MethodDeclarationStructure> {
        const generatedEndpointTypes = this.getGeneratedEndpointTypes(context);
        return {
            name: this.endpoint.name.camelCase.unsafeName,
            parameters: this.getEndpointParameters(context),
            returnType: getTextOfTsNode(
                ts.factory.createTypeReferenceNode("Promise", [
                    generatedEndpointTypes.getReferenceToResponseType(context),
                ])
            ),
            scope: Scope.Public,
            isAsync: true,
            statements: this.generateMethodBody(context),
        };
    }

    private getEndpointParameters(context: ServiceContext): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        for (const pathParameter of this.getAllPathParameters()) {
            parameters.push({
                name: this.getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
            });
        }
        if (this.requestParameter != null) {
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }
        return parameters;
    }

    private getAllPathParameters(): PathParameter[] {
        return [...this.service.pathParameters, ...this.endpoint.pathParameters];
    }

    private getParameterNameForPathParameter(pathParameter: PathParameter): string {
        return pathParameter.name.camelCase.unsafeName;
    }

    private generateMethodBody(context: ServiceContext): (StatementStructures | WriterFunction | string)[] {
        const statements: (StatementStructures | WriterFunction | string)[] = [];

        let urlSearchParamsVariable: ts.Expression | undefined;
        if (this.requestParameter != null) {
            const queryParameters = this.requestParameter.getAllQueryParameters(context);
            if (queryParameters.length > 0) {
                statements.push({
                    kind: StructureKind.VariableStatement,
                    declarationKind: VariableDeclarationKind.Const,
                    declarations: [
                        {
                            name: GeneratedEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME,
                            initializer: getTextOfTsNode(
                                ts.factory.createNewExpression(
                                    ts.factory.createIdentifier("URLSearchParams"),
                                    undefined,
                                    []
                                )
                            ),
                        },
                    ],
                });
                for (const queryParameter of queryParameters) {
                    statements.push(
                        ...this.requestParameter
                            .withQueryParameter(queryParameter, context, (referenceToQueryParameter) => [
                                ts.factory.createExpressionStatement(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(
                                                GeneratedEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME
                                            ),
                                            ts.factory.createIdentifier("append")
                                        ),
                                        undefined,
                                        [
                                            ts.factory.createStringLiteral(queryParameter.name.wireValue),
                                            context.type.stringify(referenceToQueryParameter, queryParameter.valueType),
                                        ]
                                    )
                                ),
                            ])
                            .map(getTextOfTsNode)
                    );
                }
                urlSearchParamsVariable = ts.factory.createIdentifier(
                    GeneratedEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME
                );
            }
        }

        const fetcherArgs: Fetcher.Args = {
            url: context.base.externalDependencies.urlJoin.invoke([
                this.generatedService.getEnvironment(context),
                this.buildUrl(),
            ]),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            headers: this.getHeadersForFetcherArgs(context),
            queryParameters: urlSearchParamsVariable,
            body: this.getSerializedRequestBody(context),
            timeoutMs: undefined,
        };

        statements.push({
            kind: StructureKind.VariableStatement,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: GeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME,
                    initializer: getTextOfTsNode(context.base.coreUtilities.fetcher.Fetcher._invoke(fetcherArgs)),
                },
            ],
        });

        statements.push(...this.getReturnResponseStatements(context).map(getTextOfTsNode));

        return statements;
    }

    private buildUrl(): ts.Expression {
        if (this.service.pathParameters.length === 0 && this.endpoint.pathParameters.length === 0) {
            return ts.factory.createStringLiteral(urlJoin(this.service.basePath.head, this.endpoint.path.head));
        }

        const httpPath = this.getHttpPath();

        return ts.factory.createTemplateExpression(
            ts.factory.createTemplateHead(httpPath.head),
            httpPath.parts.map((part, index) => {
                const pathParameter = this.getAllPathParameters().find(
                    (param) => param.name.originalName === part.pathParameter
                );
                if (pathParameter == null) {
                    throw new Error("Could not locate path parameter: " + part.pathParameter);
                }
                return ts.factory.createTemplateSpan(
                    ts.factory.createIdentifier(this.getParameterNameForPathParameter(pathParameter)),
                    index === httpPath.parts.length - 1
                        ? ts.factory.createTemplateTail(part.tail)
                        : ts.factory.createTemplateMiddle(part.tail)
                );
            })
        );
    }

    private getHttpPath(): HttpPath {
        const serviceBasePathPartsExceptLast = [...this.service.basePath.parts];
        const lastServiceBasePathPart = serviceBasePathPartsExceptLast.pop();

        if (lastServiceBasePathPart == null) {
            return {
                head: urlJoin(this.service.basePath.head, this.endpoint.path.head),
                parts: this.endpoint.path.parts,
            };
        }

        return {
            head: this.service.basePath.head,
            parts: [
                ...serviceBasePathPartsExceptLast,
                {
                    pathParameter: lastServiceBasePathPart.pathParameter,
                    tail: urlJoin(lastServiceBasePathPart.tail, "/", this.endpoint.path.head),
                },
                ...this.endpoint.path.parts,
            ],
        };
    }

    private getHeadersForFetcherArgs(context: ServiceContext): ts.ObjectLiteralElementLike[] {
        const elements: GeneratedHeader[] = [];
        if (this.requestParameter != null) {
            for (const header of this.requestParameter.getAllHeaders(context)) {
                elements.push({
                    header: header.name.wireValue,
                    value: this.requestParameter.getReferenceToHeader(header, context),
                });
            }
        }
        elements.push(
            ...this.generatedService.getApiHeaders(),
            ...this.generatedService.getAuthorizationHeaders(context)
        );

        return elements.map(({ header, value }) =>
            ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
        );
    }

    private getSerializedRequestBody(context: ServiceContext): ts.Expression | undefined {
        if (this.requestParameter == null) {
            return undefined;
        }
        const referenceToRequestBody = this.requestParameter.getReferenceToRequestBody(context);
        if (referenceToRequestBody == null) {
            return undefined;
        }

        return this.getGeneratedEndpointTypeSchemas(context).serializeRequest(referenceToRequestBody, context);
    }

    private getReturnResponseStatements(context: ServiceContext): ts.Statement[] {
        return [
            this.getReturnResponseIfOk(context),
            ...this.getReturnResponseForKnownErrors(context),
            this.getReturnResponseForUnknownError(context),
        ];
    }

    private getReturnResponseIfOk(context: ServiceContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock(
                [
                    ts.factory.createReturnStatement(
                        context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse._build(
                            this.getOkResponseBody(context)
                        )
                    ),
                ],
                true
            )
        );
    }

    private getOkResponseBody(context: ServiceContext): ts.Expression {
        if (this.endpoint.response.type == null) {
            return ts.factory.createIdentifier("undefined");
        }

        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createAsExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(GeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
                    context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                ),
                generatedEndpointTypeSchemas.getReferenceToRawResponse(context)
            ),
            context
        );
    }

    private getReturnResponseForKnownErrors(context: ServiceContext): ts.Statement[] {
        if (this.endpoint.errors.length === 0) {
            return [];
        }

        const referenceToError = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );

        const ifStatement = ts.factory.createIfStatement(
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
                    this.getSwitchStatementForErrors({
                        referenceToError,
                        context,
                    }),
                ],
                true
            )
        );

        return [ifStatement];
    }

    private getSwitchStatementForErrors({
        referenceToError,
        context,
    }: {
        referenceToError: ts.Expression;
        context: ServiceContext;
    }) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    referenceToError,
                    context,
                    propertyErrorDiscriminationStrategy,
                }),
            statusCode: () => this.getSwitchStatementForStatusCodeDiscriminatedErrors({ referenceToError, context }),
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        referenceToError,
        context,
        propertyErrorDiscriminationStrategy,
    }: {
        referenceToError: ts.Expression;
        context: ServiceContext;
        propertyErrorDiscriminationStrategy: ErrorDiscriminationByPropertyStrategy;
    }) {
        const allErrorsButLast = [...this.endpoint.errors];
        const lastError = allErrorsButLast.pop();

        if (lastError == null) {
            throw new Error("Cannot generate switch because there are no errors defined");
        }

        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        const referenceToErrorBody = ts.factory.createPropertyAccessExpression(
            referenceToError,
            context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );

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
                ...allErrorsButLast.map((error) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.error.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        []
                    )
                ),
                ts.factory.createCaseClause(
                    ts.factory.createStringLiteral(
                        context.error.getErrorDeclaration(lastError.error).discriminantValue.wireValue
                    ),
                    [
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
                ),
            ])
        );
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors({
        referenceToError,
        context,
    }: {
        referenceToError: ts.Expression;
        context: ServiceContext;
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                referenceToError,
                context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock(
                this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    const generatedErrorSchema = context.errorSchema.getGeneratedErrorSchema(error.error);
                    return ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                        ts.factory.createReturnStatement(
                            context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                context.endpointTypes
                                    .getGeneratedEndpointTypes(this.service.name.fernFilepath, this.endpoint.name)
                                    .getErrorUnion()
                                    .build({
                                        discriminantValueToBuild: errorDeclaration.statusCode,
                                        builderArgument:
                                            generatedErrorSchema != null
                                                ? context.base.coreUtilities.zurg.Schema._fromExpression(
                                                      context.errorSchema
                                                          .getReferenceToErrorSchema(error.error)
                                                          .getExpression()
                                                  ).parse(
                                                      ts.factory.createAsExpression(
                                                          ts.factory.createPropertyAccessExpression(
                                                              referenceToError,
                                                              context.base.coreUtilities.fetcher.Fetcher
                                                                  .FailedStatusCodeError.body
                                                          ),
                                                          generatedErrorSchema.getReferenceToRawShape(context)
                                                      )
                                                  )
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

    private getReturnResponseForUnknownError(context: ServiceContext): ts.Statement {
        const referenceToError = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );

        return ts.factory.createReturnStatement(
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                this.getGeneratedEndpointTypes(context).getErrorUnion().buildUnknown({
                    existingValue: referenceToError,
                    context,
                })
            )
        );
    }

    private getGeneratedEndpointTypes(context: ServiceContext): GeneratedEndpointTypes {
        return context.endpointTypes.getGeneratedEndpointTypes(this.service.name.fernFilepath, this.endpoint.name);
    }

    private getGeneratedEndpointTypeSchemas(context: ServiceContext): GeneratedEndpointTypeSchemas {
        return context.endpointTypeSchemas.getGeneratedEndpointTypeSchemas(
            this.service.name.fernFilepath,
            this.endpoint.name
        );
    }
}
