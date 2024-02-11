import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { RequestParameter } from "../../request-parameter/RequestParameter";

export declare namespace GeneratedQueryParams {
    export interface Init {
        requestParameter: RequestParameter | undefined;
    }
}

export class GeneratedQueryParams {
    private static QUERY_PARAMS_VARIABLE_NAME = "_queryParams";

    private requestParameter: RequestParameter | undefined;

    constructor({ requestParameter }: GeneratedQueryParams.Init) {
        this.requestParameter = requestParameter;
    }

    public getBuildStatements(context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            const queryParameters = this.requestParameter.getAllQueryParameters(context);
            if (queryParameters.length > 0) {
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME,
                                    undefined,
                                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                        ts.factory.createUnionTypeNode([
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                            ts.factory.createArrayTypeNode(
                                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                            ),
                                        ]),
                                    ]),
                                    ts.factory.createObjectLiteralExpression([], false)
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
                                        ts.factory.createBinaryExpression(
                                            ts.factory.createElementAccessExpression(
                                                ts.factory.createIdentifier(
                                                    GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME
                                                ),
                                                ts.factory.createStringLiteral(queryParameter.name.wireValue)
                                            ),
                                            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                            context.type.stringify(
                                                referenceToQueryParameter,
                                                queryParameter.valueType,
                                                { includeNullCheckIfOptional: false }
                                            )
                                        )
                                    ),
                                ];
                            },
                            (referenceToQueryParameter) => {
                                return [
                                    ts.factory.createExpressionStatement(
                                        ts.factory.createBinaryExpression(
                                            ts.factory.createElementAccessExpression(
                                                ts.factory.createIdentifier(
                                                    GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME
                                                ),
                                                ts.factory.createStringLiteral(queryParameter.name.wireValue)
                                            ),
                                            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    referenceToQueryParameter,
                                                    ts.factory.createIdentifier("map")
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createArrowFunction(
                                                        undefined,
                                                        undefined,
                                                        [
                                                            ts.factory.createParameterDeclaration(
                                                                undefined,
                                                                undefined,
                                                                undefined,
                                                                ts.factory.createIdentifier("item"),
                                                                undefined,
                                                                undefined
                                                            ),
                                                        ],
                                                        undefined,
                                                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                                        context.type.stringify(
                                                            ts.factory.createIdentifier("item"),
                                                            queryParameter.valueType,
                                                            { includeNullCheckIfOptional: false }
                                                        )
                                                    ),
                                                ]
                                            )
                                        )
                                    ),
                                ];
                            }
                        )
                    );
                }
            }
        }

        return statements;
    }

    public getReferenceTo(context: SdkContext): ts.Expression | undefined {
        if (this.requestParameter != null && this.requestParameter.getAllQueryParameters(context).length > 0) {
            return ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME);
        } else {
            return undefined;
        }
    }
}
