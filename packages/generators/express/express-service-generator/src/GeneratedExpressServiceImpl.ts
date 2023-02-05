import { HttpEndpoint, HttpMethod, HttpRequestBody, HttpService, PathParameter } from "@fern-fern/ir-model/http";
import { convertHttpPathToExpressRoute, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { ExpressServiceContext, GeneratedExpressService } from "@fern-typescript/contexts";
import { ClassDeclaration, InterfaceDeclaration, Scope, ts } from "ts-morph";

export declare namespace GeneratedExpressServiceImpl {
    export interface Init {
        service: HttpService;
        serviceClassName: string;
    }
}

export class GeneratedExpressServiceImpl implements GeneratedExpressService {
    private static ROUTER_PROPERTY_NAME = "router";
    private static METHODS_PROPERTY_NAME = "methods";
    private static ADD_MIDDLEWARE_METHOD_NAME = "addMiddleware";
    private static TO_ROUTER_METHOD_NAME = "toRouter";
    private static CATCH_BLOCK_ERROR_VARIABLE_NAME = "error";

    private serviceClassName: string;
    private service: HttpService;

    constructor({ serviceClassName, service }: GeneratedExpressServiceImpl.Init) {
        this.serviceClassName = serviceClassName;
        this.service = service;
    }

    public writeToFile(context: ExpressServiceContext): void {
        const methodsInterface = context.base.sourceFile.addInterface({
            name: this.getMethodsInterfaceName(),
            isExported: true,
        });

        for (const endpoint of this.service.endpoints) {
            this.addEndpointMethodToInterface({ endpoint, methodsInterface, context });
        }

        const serviceClass = context.base.sourceFile.addClass({
            name: this.serviceClassName,
            isExported: true,
        });
        maybeAddDocs(serviceClass, this.service.docs);

        serviceClass.addProperty({
            scope: Scope.Private,
            name: GeneratedExpressServiceImpl.ROUTER_PROPERTY_NAME,
        });

        this.addConstructor(serviceClass, context);

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

    private addConstructor(serviceClass: ClassDeclaration, context: ExpressServiceContext) {
        const middlewareParameterName = "middleware";
        serviceClass.addConstructor({
            parameters: [
                {
                    name: GeneratedExpressServiceImpl.METHODS_PROPERTY_NAME,
                    isReadonly: true,
                    scope: Scope.Private,
                    type: this.getMethodsInterfaceName(),
                },
                {
                    name: middlewareParameterName,
                    type: getTextOfTsNode(
                        ts.factory.createArrayTypeNode(context.base.externalDependencies.express.RequestHandler())
                    ),
                    initializer: getTextOfTsNode(ts.factory.createArrayLiteralExpression([])),
                },
            ],
            statements: [
                ts.factory.createExpressionStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createThis(),
                            GeneratedExpressServiceImpl.ROUTER_PROPERTY_NAME
                        ),
                        ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                        context.base.externalDependencies.express.Router.use({
                            referenceToRouter: context.base.externalDependencies.express.Router._instantiate({
                                mergeParams: true,
                            }),
                            handlers: [
                                context.base.externalDependencies.express.json(),
                                ts.factory.createSpreadElement(ts.factory.createIdentifier(middlewareParameterName)),
                            ],
                        })
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

    private addEndpointMethodToInterface({
        endpoint,
        methodsInterface,
        context,
    }: {
        endpoint: HttpEndpoint;
        methodsInterface: InterfaceDeclaration;
        context: ExpressServiceContext;
    }) {
        const REQUEST_PARAMETER_NAME = "req";
        const RESPONSE_PARAMETER_NAME = "res";

        const allPathParameters = [...this.service.pathParameters, ...endpoint.pathParameters];

        const returnType =
            endpoint.response.type != null
                ? context.type.getReferenceToType(endpoint.response.type).typeNode
                : ts.factory.createTypeReferenceNode("void");

        methodsInterface.addMethod({
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
                {
                    name: RESPONSE_PARAMETER_NAME,
                    type: getTextOfTsNode(context.base.externalDependencies.express.Response._getReferenceToType()),
                },
            ],
            returnType: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    returnType,
                    ts.factory.createTypeReferenceNode("Promise", [returnType]),
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
                        ...(endpoint.requestBody != null
                            ? this.getIfElseWithValidation({
                                  expressRequest,
                                  expressResponse,
                                  endpoint,
                                  context,
                                  requestBody: endpoint.requestBody,
                              })
                            : [
                                  this.getTryCatch({
                                      expressRequest,
                                      expressResponse,
                                      endpoint,
                                      context,
                                  }),
                              ]),
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(next, undefined, undefined)
                        ),
                    ],
                    true
                );
            },
        });
    }

    private getIfElseWithValidation({
        expressRequest,
        expressResponse,
        endpoint,
        requestBody,
        context,
    }: {
        expressRequest: ts.Expression;
        expressResponse: ts.Expression;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody;
        context: ExpressServiceContext;
    }): ts.Statement[] {
        const DESERIALIZED_REQUEST_VARIABLE_NAME = "request";

        const referenceToExpressBody = ts.factory.createPropertyAccessExpression(
            expressRequest,
            context.base.externalDependencies.express.Request.body
        );

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            DESERIALIZED_REQUEST_VARIABLE_NAME,
                            undefined,
                            undefined,
                            this.deserializeRequest({
                                endpoint,
                                requestBodyType: requestBody,
                                referenceToBody: referenceToExpressBody,
                                context,
                            })
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ...context.base.coreUtilities.zurg.Schema._visitMaybeValid(
                ts.factory.createIdentifier(DESERIALIZED_REQUEST_VARIABLE_NAME),
                {
                    valid: (validRequestBody) => [
                        ts.factory.createExpressionStatement(
                            ts.factory.createBinaryExpression(
                                referenceToExpressBody,
                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                validRequestBody
                            )
                        ),
                        this.getTryCatch({
                            expressRequest,
                            expressResponse,
                            endpoint,
                            context,
                        }),
                    ],
                    invalid: (requestErrors) => [
                        ts.factory.createExpressionStatement(
                            context.base.externalDependencies.express.Response.json({
                                referenceToExpressResponse: context.base.externalDependencies.express.Response.status({
                                    referenceToExpressResponse: expressResponse,
                                    status: 422,
                                }),
                                valueToSend: ts.factory.createObjectLiteralExpression([
                                    ts.factory.createPropertyAssignment(
                                        "errors",
                                        ts.factory.createObjectLiteralExpression([
                                            ts.factory.createPropertyAssignment("request", requestErrors),
                                        ])
                                    ),
                                ]),
                            })
                        ),
                    ],
                }
            ),
        ];
    }

    private getTryCatch({
        expressRequest,
        expressResponse,
        endpoint,
        context,
    }: {
        expressRequest: ts.Expression;
        expressResponse: ts.Expression;
        endpoint: HttpEndpoint;
        context: ExpressServiceContext;
    }): ts.TryStatement {
        return ts.factory.createTryStatement(
            ts.factory.createBlock(
                this.getStatementsForTryBlock({ expressRequest, expressResponse, endpoint, context }),
                true
            ),
            this.getCatchClause({ expressResponse, context, endpoint }),
            undefined
        );
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

        // call impl and maybe store response in RESPONSE_VARIABLE_NAME
        const implCall = ts.factory.createAwaitExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        GeneratedExpressServiceImpl.METHODS_PROPERTY_NAME
                    ),
                    this.getEndpointMethodName(endpoint)
                ),
                undefined,
                [
                    ts.factory.createAsExpression(
                        expressRequest,
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    ),
                    expressResponse,
                ]
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
                              .getGeneratedEndpointTypeSchemas(this.service.name, endpoint.name)
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
        endpoint,
    }: {
        expressResponse: ts.Expression;
        context: ExpressServiceContext;
        endpoint: HttpEndpoint;
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
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(ERROR_NAME),
                            ts.factory.createToken(ts.SyntaxKind.InstanceOfKeyword),
                            context.genericAPIExpressError.getReferenceToGenericAPIExpressError().getExpression()
                        ),
                        ts.factory.createBlock(
                            [
                                this.generateWarnForUnexpectedError(endpoint, context),
                                ts.factory.createExpressionStatement(
                                    context.genericAPIExpressError.getGeneratedGenericAPIExpressError().send({
                                        error: ts.factory.createIdentifier(ERROR_NAME),
                                        expressResponse,
                                    })
                                ),
                            ],
                            true
                        ),
                        ts.factory.createBlock(
                            [
                                ts.factory.createExpressionStatement(
                                    context.base.externalDependencies.express.Response.json({
                                        referenceToExpressResponse:
                                            context.base.externalDependencies.express.Response.status({
                                                referenceToExpressResponse: expressResponse,
                                                status: 500,
                                            }),
                                        valueToSend: ts.factory.createStringLiteral("Internal Server Error"),
                                    })
                                ),
                            ],
                            true
                        )
                    ),
                ],
                true
            )
        );
    }

    private generateWarnForUnexpectedError(endpoint: HttpEndpoint, context: ExpressServiceContext): ts.Statement {
        const warnStatement = ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("console"),
                    ts.factory.createIdentifier("warn")
                ),
                undefined,
                [
                    ts.factory.createBinaryExpression(
                        ts.factory.createBinaryExpression(
                            ts.factory.createTemplateExpression(
                                ts.factory.createTemplateHead(
                                    `Endpoint '${endpoint.name.originalName}' unexpectedly threw `
                                ),
                                [
                                    ts.factory.createTemplateSpan(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(
                                                    GeneratedExpressServiceImpl.CATCH_BLOCK_ERROR_VARIABLE_NAME
                                                ),
                                                ts.factory.createIdentifier("constructor")
                                            ),
                                            ts.factory.createIdentifier("name")
                                        ),
                                        ts.factory.createTemplateTail(".")
                                    ),
                                ]
                            ),
                            ts.factory.createToken(ts.SyntaxKind.PlusToken),
                            ts.factory.createTemplateExpression(
                                ts.factory.createTemplateHead(" If this was intentional, please add "),
                                [
                                    ts.factory.createTemplateSpan(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(
                                                    GeneratedExpressServiceImpl.CATCH_BLOCK_ERROR_VARIABLE_NAME
                                                ),
                                                ts.factory.createIdentifier("constructor")
                                            ),
                                            ts.factory.createIdentifier("name")
                                        ),
                                        ts.factory.createTemplateTail(" to")
                                    ),
                                ]
                            )
                        ),
                        ts.factory.createToken(ts.SyntaxKind.PlusToken),
                        ts.factory.createStringLiteral(" the endpoint's errors list in your Fern Definition.")
                    ),
                ]
            )
        );

        if (endpoint.errors.length === 0) {
            return warnStatement;
        }

        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(GeneratedExpressServiceImpl.CATCH_BLOCK_ERROR_VARIABLE_NAME),
                    ts.factory.createIdentifier("constructor")
                ),
                ts.factory.createIdentifier("name")
            ),
            ts.factory.createCaseBlock([
                ...endpoint.errors.map((error, index) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(context.expressError.getErrorClassName(error.error)),
                        index < endpoint.errors.length - 1 ? [] : [ts.factory.createBreakStatement()]
                    )
                ),
                ts.factory.createDefaultClause([warnStatement]),
            ])
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
                    .getReferenceToInlinedRequestBodyType(this.service.name, endpoint.name)
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
                    .getGeneratedInlinedRequestBodySchema(this.service.name, endpoint.name)
                    .deserializeRequest(referenceToBody, context),
            reference: () =>
                context.expressEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.service.name, endpoint.name)
                    .deserializeRequest(referenceToBody, context),
            _unknown: () => {
                throw new Error("Unknown HttpRequestBody: " + requestBodyType.type);
            },
        });
    }

    private getMethodsInterfaceName(): string {
        return `${this.serviceClassName}Methods`;
    }
}
