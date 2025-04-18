import { ts } from "ts-morph";

import { ExternalDependency } from "../ExternalDependency";
import { Express, ExpressHttpVerb } from "./Express";

export class ExpressImpl extends ExternalDependency implements Express {
    protected override PACKAGE = { name: "express", version: "4.18.2" };
    protected override TYPES_PACKAGE = { name: "@types/express", version: "4.17.16" };

    public NextFunction = {
        _getReferenceToType: this.withDefaultImport("express", (withImport, express) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(ts.factory.createIdentifier(express), "NextFunction"),
                    []
                );
            })
        )
    };

    public Request = {
        body: "body" as const,
        _getReferenceToType: this.withDefaultImport("express", (withImport, express) =>
            withImport(
                ({
                    pathParameters,
                    request,
                    response,
                    queryParameters
                }: {
                    pathParameters: ts.TypeNode | undefined;
                    request: ts.TypeNode | undefined;
                    response: ts.TypeNode | undefined;
                    queryParameters: ts.TypeNode | undefined;
                }) => {
                    return ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(ts.factory.createIdentifier(express), "Request"),
                        [
                            pathParameters ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
                            response ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
                            request ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
                            queryParameters ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)
                        ]
                    );
                }
            )
        )
    };

    public readonly Response = {
        _getReferenceToType: this.withDefaultImport("express", (withImport, express) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(ts.factory.createIdentifier(express), "Response"),
                    []
                );
            })
        ),

        json: ({
            referenceToExpressResponse,
            valueToSend,
            status
        }: {
            referenceToExpressResponse: ts.Expression;
            valueToSend: ts.Expression;
            status?: number;
        }): ts.Expression => {
            if (status != null) {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(referenceToExpressResponse, "status"),
                            undefined,
                            [ts.factory.createNumericLiteral(status)]
                        ),
                        "json"
                    ),
                    undefined,
                    [valueToSend]
                );
            }
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referenceToExpressResponse, "json"),
                undefined,
                [valueToSend]
            );
        },

        cookie: {
            _getBoundReference: ({
                referenceToExpressResponse
            }: {
                referenceToExpressResponse: ts.Expression;
            }): ts.Expression => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            referenceToExpressResponse,
                            ts.factory.createIdentifier("cookie")
                        ),
                        ts.factory.createIdentifier("bind")
                    ),
                    undefined,
                    [referenceToExpressResponse]
                );
            }
        },

        status: ({
            referenceToExpressResponse,
            status
        }: {
            referenceToExpressResponse: ts.Expression;
            status: number;
        }): ts.Expression => {
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referenceToExpressResponse, "status"),
                undefined,
                [ts.factory.createNumericLiteral(status)]
            );
        },
        sendStatus: ({
            referenceToExpressResponse,
            status
        }: {
            referenceToExpressResponse: ts.Expression;
            status: number;
        }): ts.Expression => {
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referenceToExpressResponse, "sendStatus"),
                undefined,
                [ts.factory.createNumericLiteral(status)]
            );
        },
        locals: ({ referenceToExpressResponse }: { referenceToExpressResponse: ts.Expression }): ts.Expression => {
            return ts.factory.createPropertyAccessExpression(referenceToExpressResponse, "locals");
        }
    };

    public readonly Express = this.withDefaultImport("express", (withImport, express) =>
        withImport(() => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier(express), "Express")
            );
        })
    );

    public readonly RequestHandler = this.withDefaultImport("express", (withImport, express) =>
        withImport(() => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(ts.factory.createIdentifier(express), "RequestHandler")
            );
        })
    );

    public readonly Router = {
        use: ({
            referenceToRouter,
            handlers
        }: {
            referenceToRouter: ts.Expression;
            handlers: ts.Expression[];
        }): ts.Expression => {
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referenceToRouter, ts.factory.createIdentifier("use")),
                undefined,
                handlers
            );
        },

        _instantiate: this.withDefaultImport("express", (withImport, express) =>
            withImport(({ mergeParams }: { mergeParams?: boolean } = {}) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(express), "Router"),
                    undefined,
                    mergeParams != null
                        ? [
                              ts.factory.createObjectLiteralExpression(
                                  [
                                      ts.factory.createPropertyAssignment(
                                          ts.factory.createIdentifier("mergeParams"),
                                          mergeParams ? ts.factory.createTrue() : ts.factory.createFalse()
                                      )
                                  ],
                                  false
                              )
                          ]
                        : []
                );
            })
        ),

        _getReferenceToType: this.withDefaultImport("express", (withImport, express) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(ts.factory.createIdentifier(express), "Router")
                );
            })
        ),

        _addRoute: ({
            referenceToRouter,
            method,
            path,
            buildHandler
        }: {
            referenceToRouter: ts.Expression;
            method: ExpressHttpVerb;
            path: string;
            buildHandler: (args: {
                expressRequest: ts.Expression;
                expressResponse: ts.Expression;
                next: ts.Expression;
            }) => ts.ConciseBody;
        }): ts.Statement => {
            const REQUEST_PARAMETER_NAME = "req";
            const RESPONSE_PARAMETER_NAME = "res";
            const NEXT_PARAMETER_NAME = "next";

            return ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(referenceToRouter, method),
                    undefined,
                    [
                        ts.factory.createStringLiteral(path),
                        ts.factory.createArrowFunction(
                            [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    REQUEST_PARAMETER_NAME
                                ),
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    RESPONSE_PARAMETER_NAME
                                ),
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    NEXT_PARAMETER_NAME
                                )
                            ],
                            undefined,
                            undefined,
                            buildHandler({
                                expressRequest: ts.factory.createIdentifier(REQUEST_PARAMETER_NAME),
                                expressResponse: ts.factory.createIdentifier(RESPONSE_PARAMETER_NAME),
                                next: ts.factory.createIdentifier(NEXT_PARAMETER_NAME)
                            })
                        )
                    ]
                )
            );
        }
    };

    public readonly App = {
        use: ({
            referenceToApp,
            path,
            router
        }: {
            referenceToApp: ts.Expression;
            path: ts.Expression;
            router: ts.Expression;
        }): ts.Expression => {
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referenceToApp, ts.factory.createIdentifier("use")),
                undefined,
                [path, router]
            );
        }
    };

    public readonly json = this.withDefaultImport("express", (withImport, express) =>
        withImport(({ strict = true }: { strict?: boolean } = {}) => {
            const options: ts.ObjectLiteralElementLike[] = [];

            if (!strict) {
                options.push(ts.factory.createPropertyAssignment("strict", ts.factory.createFalse()));
            }

            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(express), "json"),
                undefined,
                options.length > 0 ? [ts.factory.createObjectLiteralExpression(options, true)] : undefined
            );
        })
    );

    public readonly CookieOptions = {
        _getReferenceToType: this.withDefaultImport("express", (withImport, express) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(ts.factory.createIdentifier(express), "CookieOptions")
                );
            })
        )
    };
}
