import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever, Examples } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { TypeContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

/**
 * The subset of the file context that placeholder generation needs.
 */
export interface PathParameterPlaceholderContext {
    type: Pick<TypeContext, "resolveTypeReference" | "getTypeDeclaration">;
}

/**
 * Builds a value to render for a path parameter that an example does not supply, so that generated
 * examples call the endpoint with a value of the declared type instead of `undefined`. Values match
 * the ones the CLI's example generator produces for path parameters.
 *
 * Returns undefined when no placeholder of the declared type can be produced.
 */
export function getPathParameterPlaceholder({
    pathParameter,
    context
}: {
    pathParameter: FernIr.PathParameter;
    context: PathParameterPlaceholderContext;
}): ts.Expression | undefined {
    const resolvedType = context.type.resolveTypeReference(pathParameter.valueType);
    switch (resolvedType.type) {
        case "primitive":
            return getPlaceholderForPrimitive({
                primitiveType: resolvedType.primitive,
                fieldName: getOriginalName(pathParameter.name)
            });
        case "named":
            return getPlaceholderForNamedType({ typeName: resolvedType.name, context });
        case "container":
        case "unknown":
            return undefined;
        default:
            assertNever(resolvedType);
    }
}

function getPlaceholderForNamedType({
    typeName,
    context
}: {
    typeName: FernIr.DeclaredTypeName;
    context: PathParameterPlaceholderContext;
}): ts.Expression | undefined {
    const shape = context.type.getTypeDeclaration(typeName).shape;
    if (shape.type !== "enum") {
        return undefined;
    }
    const firstValue = shape.values[0];
    return firstValue != null ? ts.factory.createStringLiteral(getWireValue(firstValue.name)) : undefined;
}

function getPlaceholderForPrimitive({
    primitiveType,
    fieldName
}: {
    primitiveType: FernIr.PrimitiveType;
    fieldName: string;
}): ts.Expression {
    switch (primitiveType.v1) {
        case "STRING":
            return ts.factory.createStringLiteral(fieldName);
        case "BASE_64":
            return ts.factory.createStringLiteral(Examples.BASE64);
        case "BOOLEAN":
            return Examples.BOOLEAN ? ts.factory.createTrue() : ts.factory.createFalse();
        case "DATE":
            return ts.factory.createStringLiteral(Examples.DATE);
        case "DATE_TIME":
            return ts.factory.createStringLiteral(Examples.DATE_TIME);
        case "DATE_TIME_RFC_2822":
            return ts.factory.createStringLiteral(Examples.DATE_TIME_RFC_2822);
        case "UUID":
            return ts.factory.createStringLiteral(Examples.UUID);
        case "BIG_INTEGER":
            return ts.factory.createStringLiteral(Examples.BIG_INTEGER);
        case "DOUBLE":
            return ts.factory.createNumericLiteral(Examples.DOUBLE);
        case "FLOAT":
            return ts.factory.createNumericLiteral(Examples.FLOAT);
        case "INTEGER":
            return ts.factory.createNumericLiteral(Examples.INT);
        case "UINT":
            return ts.factory.createNumericLiteral(Examples.UINT);
        case "UINT_64":
            return ts.factory.createNumericLiteral(Examples.UINT64);
        case "LONG":
            return ts.factory.createNumericLiteral(Examples.INT64);
        default:
            assertNever(primitiveType.v1);
    }
}
