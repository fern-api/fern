import {
    HttpEndpoint,
    HttpPath,
    HttpRequestBody,
    HttpService,
    PathParameter,
    SdkRequestShape,
} from "@fern-fern/ir-model/http";
import { Fetcher, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkClientClassContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import urlJoin from "url-join";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { GeneratedHeader } from "./GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "./GeneratedSdkClientClassImpl";
import { RequestBodyParameter } from "./request-parameter/RequestBodyParameter";
import { RequestParameter } from "./request-parameter/RequestParameter";
import { RequestWrapperParameter } from "./request-parameter/RequestWrapperParameter";

export declare namespace AbstractGeneratedEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
    }
}

export abstract class AbstractGeneratedEndpointImplementation implements GeneratedEndpointImplementation {
    // these start with an underscore to prevent collisions with path parameters
    protected static RESPONSE_VARIABLE_NAME = "_response";
    protected static QUERY_PARAMS_VARIABLE_NAME = "_queryParams";

    public readonly endpoint: HttpEndpoint;
    protected packageId: PackageId;
    protected service: HttpService;
    protected generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private requestParameter: RequestParameter | undefined;
    private includeCredentialsOnCrossOriginRequests: boolean;

    constructor({
        packageId,
        service,
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
    }: AbstractGeneratedEndpointImplementation.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;

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
        { requestBodyIntersection }: { requestBodyIntersection?: ts.TypeNode } = {}
    ): EndpointSignature {
        return {
            parameters: this.getEndpointParameters(context, { requestBodyIntersection }),
            returnTypeWithoutPromise: this.getResponseType(context),
        };
    }

    public getDocs(context: SdkClientClassContext): string | undefined {
        const parts: string[] = [];

        if (this.endpoint.docs != null) {
            parts.push(this.endpoint.docs);
        }
        parts.push(...this.getAdditionalDocLines(context));

        if (parts.length === 0) {
            return undefined;
        }

        return parts.join("\n");
    }

    public getReferenceToRequestBody(context: SdkClientClassContext): ts.Expression | undefined {
        return this.requestParameter?.getReferenceToRequestBody(context);
    }

    private getEndpointParameters(
        context: SdkClientClassContext,
        { requestBodyIntersection }: { requestBodyIntersection: ts.TypeNode | undefined }
    ): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        for (const pathParameter of this.getAllPathParameters()) {
            parameters.push({
                name: this.getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
            });
        }
        if (this.requestParameter != null) {
            parameters.push(
                this.requestParameter.getParameterDeclaration(context, { typeIntersection: requestBodyIntersection })
            );
        }
        parameters.push(...this.getAdditionalEndpointParameters(context));
        return parameters;
    }

    private getAllPathParameters(): PathParameter[] {
        return [...this.service.pathParameters, ...this.endpoint.pathParameters];
    }

    private getParameterNameForPathParameter(pathParameter: PathParameter): string {
        return pathParameter.name.camelCase.unsafeName;
    }

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        let urlSearchParamsVariable: ts.Expression | undefined;
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
                                    AbstractGeneratedEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME,
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
                                                    AbstractGeneratedEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME
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
                urlSearchParamsVariable = ts.factory.createIdentifier(
                    AbstractGeneratedEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME
                );
            }
        }

        const fetcherArgs: Fetcher.Args = {
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            headers: this.getHeaders(context),
            queryParameters: urlSearchParamsVariable,
            body: this.getSerializedRequestBody(context),
            timeoutMs: undefined,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
        };

        statements.push(...this.invokeFetcher(fetcherArgs, context));

        statements.push(...this.getReturnResponseStatements(context));

        return statements;
    }

    private getReferenceToEnvironment(context: SdkClientClassContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(context);
        const url = this.buildUrl(context);
        if (url != null) {
            return context.base.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    private buildUrl(context: SdkClientClassContext): ts.Expression | undefined {
        if (this.service.pathParameters.length === 0 && this.endpoint.pathParameters.length === 0) {
            const joinedUrl = urlJoin(this.service.basePath.head, this.endpoint.path.head);
            if (joinedUrl.length === 0) {
                return undefined;
            }
            return ts.factory.createStringLiteral(joinedUrl);
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

                let referenceToPathParameterValue: ts.Expression = ts.factory.createIdentifier(
                    this.getParameterNameForPathParameter(pathParameter)
                );
                if (pathParameter.valueType._type === "named") {
                    referenceToPathParameterValue = context.typeSchema
                        .getSchemaOfNamedType(pathParameter.valueType, {
                            isGeneratingSchema: false,
                        })
                        .jsonOrThrow(referenceToPathParameterValue, {
                            unrecognizedObjectKeys: "fail",
                            allowUnrecognizedEnumValues: false,
                            allowUnrecognizedUnionMembers: false,
                        });
                }

                return ts.factory.createTemplateSpan(
                    referenceToPathParameterValue,
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
                    tail:
                        lastServiceBasePathPart.tail.length > 0
                            ? urlJoin(lastServiceBasePathPart.tail, this.endpoint.path.head)
                            : this.endpoint.path.head,
                },
                ...this.endpoint.path.parts,
            ],
        };
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
        if (this.requestParameter == null || this.endpoint.requestBody == null) {
            return undefined;
        }
        const referenceToRequestBody = this.requestParameter.getReferenceToRequestBody(context);
        if (referenceToRequestBody == null) {
            return undefined;
        }

        return HttpRequestBody._visit(this.endpoint.requestBody, {
            inlinedRequestBody: () => {
                return context.sdkInlinedRequestBodySchema
                    .getGeneratedInlinedRequestBodySchema(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            },
            reference: () =>
                context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context),
            _unknown: () => {
                throw new Error("Unknown HttpRequestBody type: " + this.endpoint.requestBody?.type);
            },
        });
    }

    protected getGeneratedEndpointTypeSchemas(context: SdkClientClassContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    protected abstract getAdditionalEndpointParameters(
        context: SdkClientClassContext
    ): OptionalKind<ParameterDeclarationStructure>[];
    protected abstract getAdditionalDocLines(context: SdkClientClassContext): string[];
    protected abstract invokeFetcher(fetcherArgs: Fetcher.Args, context: SdkClientClassContext): ts.Statement[];
    protected abstract getReturnResponseStatements(context: SdkClientClassContext): ts.Statement[];
    protected abstract getResponseType(context: SdkClientClassContext): ts.TypeNode;
}
