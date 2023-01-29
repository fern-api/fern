import { HttpEndpoint, HttpMethod, HttpRequestBody, HttpService, PathParameter } from "@fern-fern/ir-model/http";
import { convertHttpPathToExpressRoute, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { ExpressServiceContext, GeneratedExpressService } from "@fern-typescript/contexts";
import { ClassDeclaration, Scope, ts } from "ts-morph";

export declare namespace GeneratedExpressServiceImpl {
    export interface Init {
        service: HttpService;
        serviceClassName: string;
    }
}

export class GeneratedExpressServiceImpl implements GeneratedExpressService {
    private static ROUTER_PROPERTY_NAME = "router";
    private static ADD_MIDDLEWARE_METHOD_NAME = "addMiddleware";
    private static TO_ROUTER_METHOD_NAME = "toRouter";

    private serviceClassName: string;
    private service: HttpService;

    constructor({ serviceClassName, service }: GeneratedExpressServiceImpl.Init) {
        this.serviceClassName = serviceClassName;
        this.service = service;
    }

    public writeToFile(context: ExpressServiceContext): void {
        const serviceClass = context.base.sourceFile.addClass({
            name: this.serviceClassName,
            isExported: true,
            isAbstract: true,
        });
        maybeAddDocs(serviceClass, this.service.docs);

        serviceClass.addProperty({
            scope: Scope.Private,
            name: GeneratedExpressServiceImpl.ROUTER_PROPERTY_NAME,
            initializer: getTextOfTsNode(
                context.base.externalDependencies.express.Router.use({
                    referenceToRouter: context.base.externalDependencies.express.Router._instantiate(),
                    handlers: [context.base.externalDependencies.express.json()],
                })
            ),
        });

        for (const endpoint of this.service.endpoints) {
            this.addAbstractEndpointMethod({ endpoint, serviceClass, context });
        }

        this.addAddMiddlewareMethod({ serviceClass, context });

        serviceClass.addMethod({
            scope: Scope.Public,
            name: GeneratedExpressServiceImpl.TO_ROUTER_METHOD_NAME,
            returnType: getTextOfTsNode(context.base.externalDependencies.express.Router._getReferenceToType()),
            statements: [
                ...this.service.endpoints.map((endpoint) => this.addRouteToRouter(endpoint, context)),
                ts.factory.createReturnStatement(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        GeneratedExpressServiceImpl.ROUTER_PROPERTY_NAME
                    )
                ),
            ].map(getTextOfTsNode),
        });
    }

    public toRouter(referenceToService: ts.Expression): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                referenceToService,
                GeneratedExpressServiceImpl.TO_ROUTER_METHOD_NAME
            ),
            undefined,
            undefined
        );
    }

    private addAbstractEndpointMethod({
        endpoint,
        serviceClass,
        context,
    }: {
        endpoint: HttpEndpoint;
        serviceClass: ClassDeclaration;
        context: ExpressServiceContext;
    }) {
        const REQUEST_PARAMETER_NAME = "request";

        const allPathParameters = [...this.service.pathParameters, ...endpoint.pathParameters];
        serviceClass.addMethod({
            isAbstract: true,
            scope: Scope.Public,
            name: this.getEndpointMethodName(endpoint),
            parameters: [
                {
                    name: REQUEST_PARAMETER_NAME,
                    type: getTextOfTsNode(
                        context.base.externalDependencies.express.Request._getReferenceToType({
                            pathParameters:
                                allPathParameters.length > 0
                                    ? ts.factory.createTypeLiteralNode(
                                          allPathParameters.map((pathParameter) => {
                                              const type = context.typeSchema.getReferenceToRawType(
                                                  pathParameter.valueType
                                              );
                                              return ts.factory.createPropertySignature(
                                                  undefined,
                                                  this.getPathParameterName(pathParameter),
                                                  type.isOptional
                                                      ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                                                      : undefined,
                                                  type.typeNodeWithoutUndefined
                                              );
                                          })
                                      )
                                    : undefined,
                            queryParameters:
                                endpoint.queryParameters.length > 0
                                    ? ts.factory.createTypeLiteralNode(
                                          endpoint.queryParameters.map((queryParameter) => {
                                              const type = context.typeSchema.getReferenceToRawType(
                                                  queryParameter.valueType
                                              );
                                              return ts.factory.createPropertySignature(
                                                  undefined,
                                                  ts.factory.createStringLiteral(queryParameter.name.wireValue),
                                                  type.isOptional
                                                      ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                                                      : undefined,
                                                  type.typeNodeWithoutUndefined
                                              );
                                          })
                                      )
                                    : undefined,
                            request:
                                endpoint.requestBody != null
                                    ? this.getReferenceToParsedRequestBody({
                                          endpoint,
                                          requestBody: endpoint.requestBody,
                                          context,
                                      })
                                    : undefined,
                            response:
                                endpoint.response.type != null
                                    ? context.type.getReferenceToType(endpoint.response.type).typeNode
                                    : undefined,
                        })
                    ),
                },
            ],
            returnType: getTextOfTsNode(
                ts.factory.createTypeReferenceNode("Promise", [
                    endpoint.response.type != null
                        ? context.type.getReferenceToType(endpoint.response.type).typeNode
                        : ts.factory.createTypeReferenceNode("void"),
                ])
            ),
        });
    }

    private addAddMiddlewareMethod({
        serviceClass,
        context,
    }: {
        serviceClass: ClassDeclaration;
        context: ExpressServiceContext;
    }) {
        const HANDLER_PARAMETER_NAME = "handler";

        serviceClass.addMethod({
            scope: Scope.Public,
            name: GeneratedExpressServiceImpl.ADD_MIDDLEWARE_METHOD_NAME,
            parameters: [
                {
                    name: HANDLER_PARAMETER_NAME,
                    type: getTextOfTsNode(context.base.externalDependencies.express.RequestHandler()),
                },
            ],
            returnType: getTextOfTsNode(ts.factory.createThisTypeNode()),
            statements: [
                ts.factory.createExpressionStatement(
                    context.base.externalDependencies.express.Router.use({
                        referenceToRouter: this.getReferenceToRouter(),
                        handlers: [ts.factory.createIdentifier(HANDLER_PARAMETER_NAME)],
                    })
                ),
                ts.factory.createReturnStatement(ts.factory.createThis()),
            ].map(getTextOfTsNode),
        });
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.camelCase.unsafeName;
    }

    private addRouteToRouter(endpoint: HttpEndpoint, context: ExpressServiceContext): ts.Statement {
        return context.base.externalDependencies.express.Router._addRoute({
            referenceToRouter: this.getReferenceToRouter(),
            method: HttpMethod._visit<"get" | "post" | "put" | "patch" | "delete">(endpoint.method, {
                get: () => "get",
                post: () => "post",
                put: () => "put",
                patch: () => "patch",
                delete: () => "delete",
                _unknown: () => {
                    throw new Error("Unknown ");
                },
            }),
            path: convertHttpPathToExpressRoute(endpoint.path),
            buildHandler: ({ expressRequest, expressResponse, next }) => {
                return ts.factory.createBlock(
                    [
                        ts.factory.createTryStatement(
                            ts.factory.createBlock(
                                this.getStatementsForTryBlock({ expressRequest, expressResponse, endpoint, context }),
                                true
                            ),
                            this.getCatchClause({ expressResponse, context }),
                            undefined
                        ),
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(next, undefined, undefined)
                        ),
                    ],
                    true
                );
            },
        });
    }

    private getStatementsForTryBlock({
        expressRequest,
        expressResponse,
        endpoint,
        context,
    }: {
        expressRequest: ts.Expression;
        expressResponse: ts.Expression;
        endpoint: HttpEndpoint;
        context: ExpressServiceContext;
    }): ts.Statement[] {
        const RESPONSE_VARIABLE_NAME = "response";

        const statements: ts.Statement[] = [];

        // deserialize request
        if (endpoint.requestBody != null) {
            const referenceToExpressBody = ts.factory.createPropertyAccessExpression(
                expressRequest,
                context.base.externalDependencies.express.Request.body
            );
            statements.push(
                ts.factory.createExpressionStatement(
                    ts.factory.createBinaryExpression(
                        referenceToExpressBody,
                        ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                        this.deserializeRequest({
                            endpoint,
                            requestBodyType: endpoint.requestBody,
                            referenceToBody: referenceToExpressBody,
                            context,
                        })
                    )
                )
            );
        }

        // call impl and maybe store response in RESPONSE_VARIABLE_NAME
        const implCall = ts.factory.createAwaitExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createThis(),
                    this.getEndpointMethodName(endpoint)
                ),
                undefined,
                [expressRequest]
            )
        );
        statements.push(
            endpoint.response.type != null
                ? ts.factory.createVariableStatement(
                      undefined,
                      ts.factory.createVariableDeclarationList(
                          [
                              ts.factory.createVariableDeclaration(
                                  ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME),
                                  undefined,
                                  undefined,
                                  implCall
                              ),
                          ],
                          ts.NodeFlags.Const
                      )
                  )
                : ts.factory.createExpressionStatement(implCall)
        );

        // send response
        statements.push(
            ts.factory.createExpressionStatement(
                endpoint.response.type != null
                    ? context.base.externalDependencies.express.Response.json({
                          referenceToExpressResponse: expressResponse,
                          valueToSend: context.expressEndpointTypeSchemas
                              .getGeneratedEndpointTypeSchemas(this.service.name.fernFilepath, endpoint.name)
                              .serializeResponse(ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME), context),
                      })
                    : context.base.externalDependencies.express.Response.sendStatus({
                          referenceToExpressResponse: expressResponse,
                          status: 204,
                      })
            )
        );

        return statements;
    }

    private getCatchClause({
        expressResponse,
        context,
    }: {
        expressResponse: ts.Expression;
        context: ExpressServiceContext;
    }): ts.CatchClause {
        const ERROR_NAME = "error";

        return ts.factory.createCatchClause(
            ts.factory.createVariableDeclaration(ts.factory.createIdentifier(ERROR_NAME)),
            ts.factory.createBlock(
                [
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("console"),
                                ts.factory.createIdentifier("error")
                            ),
                            undefined,
                            [ts.factory.createIdentifier(ERROR_NAME)]
                        )
                    ),
                    ts.factory.createExpressionStatement(
                        context.base.externalDependencies.express.Response.json({
                            referenceToExpressResponse: context.base.externalDependencies.express.Response.status({
                                referenceToExpressResponse: expressResponse,
                                status: 500,
                            }),
                            valueToSend: ts.factory.createStringLiteral("Internal Server Error"),
                        })
                    ),
                ],
                true
            )
        );
    }

    private getReferenceToRouter(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedExpressServiceImpl.ROUTER_PROPERTY_NAME
        );
    }

    private getPathParameterName(pathParameter: PathParameter): string {
        return pathParameter.name.originalName;
    }

    private getReferenceToParsedRequestBody({
        endpoint,
        requestBody,
        context,
    }: {
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody;
        context: ExpressServiceContext;
    }): ts.TypeNode {
        return HttpRequestBody._visit(requestBody, {
            inlinedRequestBody: () =>
                context.expressInlinedRequestBody
                    .getReferenceToInlinedRequestBodyType(this.service.name.fernFilepath, endpoint.name)
                    .getTypeNode(),
            reference: ({ requestBodyType }) => context.type.getReferenceToType(requestBodyType).typeNode,
            _unknown: () => {
                throw new Error("Unknown HttpRequestBody: " + requestBody.type);
            },
        });
    }

    private deserializeRequest({
        endpoint,
        requestBodyType,
        referenceToBody,
        context,
    }: {
        endpoint: HttpEndpoint;
        requestBodyType: HttpRequestBody;
        referenceToBody: ts.Expression;
        context: ExpressServiceContext;
    }): ts.Expression {
        return HttpRequestBody._visit(requestBodyType, {
            inlinedRequestBody: () =>
                context.expressInlinedRequestBodySchema
                    .getGeneratedInlinedRequestBodySchema(this.service.name.fernFilepath, endpoint.name)
                    .deserializeRequest(referenceToBody, context),
            reference: () =>
                context.expressEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.service.name.fernFilepath, endpoint.name)
                    .deserializeRequest(referenceToBody, context),
            _unknown: () => {
                throw new Error("Unknown HttpRequestBody: " + requestBodyType.type);
            },
        });
    }
}
