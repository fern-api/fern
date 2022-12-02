import { HttpEndpoint, HttpPath, HttpService } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    GeneratedEndpointTypes,
    GeneratedEndpointTypeSchemas,
    ServiceContext,
} from "@fern-typescript/sdk-declaration-handler";
import {
    MethodDeclarationStructure,
    OptionalKind,
    Scope,
    StatementStructures,
    StructureKind,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import urlJoin from "url-join";
import { FetcherArgsBuilder } from "./FetcherArgsBuilder";

export declare namespace GeneratedEndpointImplementation {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export class GeneratedEndpointImplementation {
    private static REQUEST_PARAMETER_NAME = "request";
    private static RESPONSE_VARIABLE_NAME = "response";

    private service: HttpService;
    private endpoint: HttpEndpoint;

    constructor({ service, endpoint }: GeneratedEndpointImplementation.Init) {
        this.service = service;
        this.endpoint = endpoint;
    }

    public getImplementation(context: ServiceContext): OptionalKind<MethodDeclarationStructure> {
        const generatedEndpointTypes = this.getGeneratedEndpointTypes(context);
        const requestType = generatedEndpointTypes.getReferenceToRequestType(context);
        return {
            name: this.endpoint.nameV2.unsafeName.camelCase,
            parameters:
                requestType != null
                    ? [
                          {
                              name: GeneratedEndpointImplementation.REQUEST_PARAMETER_NAME,
                              type: getTextOfTsNode(requestType.typeNodeWithoutUndefined),
                              hasQuestionToken: requestType.isOptional,
                          },
                      ]
                    : [],
            returnType: getTextOfTsNode(generatedEndpointTypes.getReferenceToResponseType(context)),
            scope: Scope.Public,
            isAsync: true,
            statements: this.generateMethodBody(context),
        };
    }

    private generateMethodBody(context: ServiceContext): (StatementStructures | WriterFunction | string)[] {
        const statements: (StatementStructures | WriterFunction | string)[] = [];

        const generatedEndpointTypes = this.getGeneratedEndpointTypes(context);

        const fetcherArgsBuilder = new FetcherArgsBuilder({
            url: this.buildUrl(context),
            method: this.endpoint.method,
            body:
                this.endpoint.request.typeV2 != null
                    ? this.getGeneratedEndpointTypeSchemas(context).serializeRequest(
                          this.getGeneratedEndpointTypes(context).getReferenceToRequestBody(
                              ts.factory.createIdentifier(GeneratedEndpointImplementation.REQUEST_PARAMETER_NAME)
                          ),
                          context
                      )
                    : undefined,
        });

        for (const queryParameter of this.endpoint.queryParameters) {
            const type = context.type.getReferenceToType(queryParameter.valueType);
            const value = generatedEndpointTypes.getReferenceToQueryParameter(
                queryParameter,
                ts.factory.createIdentifier(GeneratedEndpointImplementation.REQUEST_PARAMETER_NAME)
            );
            fetcherArgsBuilder.addQueryParameter({
                isNullable: type.isOptional,
                key: queryParameter.nameV2.wireValue,
                value,
                valueAsString: context.type.stringify(value, queryParameter.valueType),
            });
        }

        for (const header of this.endpoint.headers) {
            fetcherArgsBuilder.addHeader({
                header: header.nameV2.wireValue,
                value: generatedEndpointTypes.getReferenceToHeader(
                    header,
                    ts.factory.createIdentifier(GeneratedEndpointImplementation.REQUEST_PARAMETER_NAME)
                ),
            });
        }

        const { statementsToPrepend, fetcherArgs } = fetcherArgsBuilder.build();
        statements.push(...statementsToPrepend.map(getTextOfTsNode));

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

    private buildUrl(context: ServiceContext): ts.Expression {
        if (this.service.pathParameters.length === 0 && this.endpoint.pathParameters.length === 0) {
            if (this.service.basePathV2 == null) {
                return ts.factory.createStringLiteral(this.endpoint.path.head);
            }
            return ts.factory.createStringLiteral(urlJoin(this.service.basePathV2.head, this.endpoint.path.head));
        }

        const generatedEndpointTypes = this.getGeneratedEndpointTypes(context);
        const httpPath = this.getHttpPath();

        return ts.factory.createTemplateExpression(
            ts.factory.createTemplateHead(httpPath.head),
            httpPath.parts.map((part, index) => {
                return ts.factory.createTemplateSpan(
                    generatedEndpointTypes.getReferenceToPathParameter(
                        part.pathParameter,
                        ts.factory.createIdentifier(GeneratedEndpointImplementation.REQUEST_PARAMETER_NAME)
                    ),
                    index === httpPath.parts.length - 1
                        ? ts.factory.createTemplateTail(part.tail)
                        : ts.factory.createTemplateMiddle(part.tail)
                );
            })
        );
    }

    private getHttpPath(): HttpPath {
        if (this.service.basePathV2 == null) {
            return this.endpoint.path;
        }

        const serviceBasePathPartsExceptLast = [...this.service.basePathV2.parts];
        const lastServiceBasePathPart = serviceBasePathPartsExceptLast.pop();

        if (lastServiceBasePathPart == null) {
            return {
                head: urlJoin(this.service.basePathV2.head, this.endpoint.path.head),
                parts: this.endpoint.path.parts,
            };
        }

        return {
            head: this.service.basePathV2.head,
            parts: [
                ...serviceBasePathPartsExceptLast,
                {
                    pathParameter: lastServiceBasePathPart.pathParameter,
                    tail: urlJoin(lastServiceBasePathPart.tail, this.endpoint.path.head),
                },
                ...this.endpoint.path.parts,
            ],
        };
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
        if (this.endpoint.response.typeV2 == null) {
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
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);

        const referenceToError = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
        const referenceToErrorBody = ts.factory.createPropertyAccessExpression(
            referenceToError,
            context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
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
                ],
                true
            )
        );

        return [ifStatement];
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
        return context.endpointTypes.getGeneratedEndpointTypes(this.service.name, this.endpoint.id);
    }

    private getGeneratedEndpointTypeSchemas(context: ServiceContext): GeneratedEndpointTypeSchemas {
        return context.endpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.service.name, this.endpoint.id);
    }
}
