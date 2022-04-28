import { HttpEndpoint, NamedType, PrimitiveType, QueryParameter, TypeReference } from "@fern-api/api";
import { ResolvedType, TypeResolver } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { getQueryParameterReference } from "../generate-endpoint-types/request/generateRequestTypes";
import { QUERY_PARAMETERS_VARIABLE_NAME } from "./constants";

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
                        ts.factory.createIdentifier(QUERY_PARAMETERS_VARIABLE_NAME),
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
                    ts.factory.createIdentifier(QUERY_PARAMETERS_VARIABLE_NAME),
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
        named: (namedType) => isNamedTypeStringLike({ namedType, typeResolver }),
        container: () => false,
        primitive: isPrimitiveStringLike,
        void: () => false,
        unknown: () => false,
    });
}

function isNamedTypeStringLike({
    namedType,
    typeResolver,
}: {
    namedType: NamedType;
    typeResolver: TypeResolver;
}): boolean {
    return ResolvedType._visit(typeResolver.resolveNamedType(namedType), {
        object: () => false,
        union: () => false,
        enum: () => true,
        container: () => false,
        primitive: isPrimitiveStringLike,
        void: () => false,
        unknown: () => false,
    });
}

function isPrimitiveStringLike(primitive: PrimitiveType): boolean {
    return PrimitiveType.visit(primitive, {
        String: () => true,
        Integer: () => false,
        Long: () => false,
        Double: () => false,
        Boolean: () => false,
        unknown: () => false,
    });
}
