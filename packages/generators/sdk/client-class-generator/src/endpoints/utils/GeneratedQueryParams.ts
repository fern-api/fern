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
                                    undefined,
                                    context.externalDependencies.URLSearchParams.instantiate()
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
                                        context.externalDependencies.URLSearchParams.append({
                                            key: ts.factory.createStringLiteral(queryParameter.name.wireValue),
                                            value: context.type.stringify(
                                                referenceToQueryParameter,
                                                queryParameter.valueType,
                                                { includeNullCheckIfOptional: false }
                                            ),
                                            referenceToUrlSearchParams: ts.factory.createIdentifier(
                                                GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME
                                            ),
                                        })
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
