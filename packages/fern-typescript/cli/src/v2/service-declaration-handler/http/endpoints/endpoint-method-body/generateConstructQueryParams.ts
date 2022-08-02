import { QueryParameter } from "@fern-fern/ir-model/services";
import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { WrapperField } from "../parse-endpoint/constructRequestWrapper";
import { ParsedClientEndpoint } from "../parse-endpoint/parseEndpointAndGenerateEndpointModule";

export function generateConstructQueryParams(endpoint: ParsedClientEndpoint): ts.Statement[] {
    const statements: ts.Statement[] = [];
    if (endpoint.request == null || !endpoint.request.isWrapped || endpoint.request.queryParameters.length === 0) {
        return statements;
    }

    // create URLSearchParams
    statements.push(
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS),
                        undefined,
                        undefined,
                        ts.factory.createNewExpression(ts.factory.createIdentifier("URLSearchParams"), undefined, [])
                    ),
                ],
                ts.NodeFlags.Const
            )
        )
    );

    for (const queryParameter of endpoint.request.queryParameters) {
        const queryParameterReference = getQueryParameterReference({ queryParameter });

        const appendStatement = ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS),
                    ts.factory.createIdentifier("append")
                ),
                undefined,
                [ts.factory.createStringLiteral(queryParameter.originalData.key), queryParameterReference]
            )
        );

        if (
            queryParameter.originalData.valueType._type === "container" &&
            queryParameter.originalData.valueType.container._type === "optional"
        ) {
            statements.push(
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        queryParameterReference,
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock([appendStatement])
                )
            );
        } else {
            statements.push(appendStatement);
        }
    }

    return statements;
}

function getQueryParameterReference({
    queryParameter,
}: {
    queryParameter: WrapperField<QueryParameter>;
}): ts.PropertyAccessExpression {
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
        ts.factory.createIdentifier(queryParameter.key)
    );
}
