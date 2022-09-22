import {
    ContainerType,
    PrimitiveType,
    ResolvedTypeReference,
    ShapeType,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { File } from "@fern-typescript/declaration-handler";
import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { ParsedClientEndpoint } from "../parse-endpoint/ParsedClientEndpoint";

export function generateConstructQueryParams({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: File;
}): ts.Statement[] {
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
        const queryParameterReference = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
            ts.factory.createIdentifier(queryParameter.key)
        );

        const appendStatement = ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS),
                    ts.factory.createIdentifier("append")
                ),
                undefined,
                [
                    ts.factory.createStringLiteral(queryParameter.originalData.name.wireValue),
                    getValueAsString({
                        value: queryParameterReference,
                        type: queryParameter.originalData.valueType,
                        file,
                    }),
                ]
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

/**
 * this will ignore optional wrappers
 * e.g.
 *      type: optional<number>
 *      returns: value.toString()
 */
function getValueAsString({
    value,
    type,
    file,
}: {
    value: ts.Expression;
    type: TypeReference;
    file: File;
}): ts.Expression {
    const resolvedType = file.resolveTypeReference(type);

    function throwNotSupported(): never {
        throw new Error("Type cannot be converted to string: " + resolvedType._type);
    }

    return ResolvedTypeReference._visit<ts.Expression>(resolvedType, {
        primitive: (primitive) => {
            return PrimitiveType._visit(primitive, {
                integer: () => getNumberAsString(value),
                double: () => getNumberAsString(value),
                string: () => value,
                boolean: () =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(value, "toString"),
                        undefined,
                        undefined
                    ),
                long: () => getNumberAsString(value),
                dateTime: () => value,
                uuid: () => value,
                _unknown: throwNotSupported,
            });
        },
        container: (container) =>
            ContainerType._visit<ts.Expression>(container, {
                optional: (wrappedType) => getValueAsString({ value, type: wrappedType, file }),
                list: throwNotSupported,
                map: throwNotSupported,
                set: throwNotSupported,
                _unknown: throwNotSupported,
            }),
        named: ({ shape }) =>
            ShapeType._visit<ts.Expression>(shape, {
                object: throwNotSupported,
                union: throwNotSupported,
                enum: () => value,
                _unknown: throwNotSupported,
            }),
        unknown: () => ts.factory.createAsExpression(value, ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
        void: throwNotSupported,
        _unknown: throwNotSupported,
    });
}

function getNumberAsString(value: ts.Expression) {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(value, "toString"),
        undefined,
        undefined
    );
}
