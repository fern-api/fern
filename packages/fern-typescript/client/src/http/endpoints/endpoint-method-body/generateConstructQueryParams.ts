import { HttpEndpoint, PrimitiveType, QueryParameter, TypeName, TypeReference } from "@fern-api/api";
import { ResolvedType, TypeResolver } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";

export function generateConstructQueryParams({
    endpoint,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    typeResolver: TypeResolver;
}): ts.Statement[] {
    const statements: ts.Statement[] = [];
    if (endpoint.queryParameters.length === 0) {
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

    for (const queryParameter of endpoint.queryParameters) {
        const queryParameterReference = getQueryParameterReference(queryParameter);

        const appendStatement = ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS),
                    ts.factory.createIdentifier("append")
                ),
                undefined,
                [
                    ts.factory.createStringLiteral(queryParameter.key),
                    getStringVersionOfQueryParameter({ queryParameter, queryParameterReference, typeResolver }),
                ]
            )
        );

        if (queryParameter.valueType._type === "container" && queryParameter.valueType.container._type === "optional") {
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

function getStringVersionOfQueryParameter({
    queryParameter,
    queryParameterReference,
    typeResolver,
}: {
    queryParameter: QueryParameter;
    queryParameterReference: ts.PropertyAccessExpression;
    typeResolver: TypeResolver;
}): ts.Expression {
    if (isTypeReferenceStringLike({ typeReference: queryParameter.valueType, typeResolver })) {
        return queryParameterReference;
    } else {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(queryParameterReference, ts.factory.createIdentifier("toString")),
            undefined,
            []
        );
    }
}

function isTypeReferenceStringLike({
    typeReference,
    typeResolver,
}: {
    typeReference: TypeReference;
    typeResolver: TypeResolver;
}): boolean {
    return TypeReference._visit(typeReference, {
        named: (namedType) => isTypeNameStringLike({ namedType, typeResolver }),
        container: () => false,
        primitive: isPrimitiveStringLike,
        void: () => false,
        unknown: () => false,
        _unknown: () => false,
    });
}

function isTypeNameStringLike({
    namedType,
    typeResolver,
}: {
    namedType: TypeName;
    typeResolver: TypeResolver;
}): boolean {
    return ResolvedType._visit(typeResolver.resolveTypeName(namedType), {
        object: () => false,
        union: () => false,
        enum: () => true,
        container: () => false,
        primitive: isPrimitiveStringLike,
        unknown: () => false,
        void: () => false,
        _unknown: () => false,
    });
}

function isPrimitiveStringLike(primitive: PrimitiveType): boolean {
    return PrimitiveType._visit(primitive, {
        string: () => true,
        dateTime: () => true,
        integer: () => false,
        long: () => false,
        double: () => false,
        boolean: () => false,
        _unknown: () => false,
    });
}

function getQueryParameterReference(queryParameter: QueryParameter): ts.PropertyAccessExpression {
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
        ts.factory.createIdentifier(queryParameter.key)
    );
}
