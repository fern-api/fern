import { getOriginalName } from "@fern-api/base-generator";
import { assertNever, Examples } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Builds a value to render for a path parameter that an example does not supply, so that generated
 * examples call the endpoint with every required argument instead of dropping it. Values match the
 * ones the CLI's example generator produces for path parameters.
 *
 * Returns undefined when no placeholder of the declared type can be produced, in which case the
 * argument is left out as before.
 */
export function getPathParameterPlaceholder({
    pathParameter,
    types
}: {
    pathParameter: FernIr.PathParameter;
    types: Record<FernIr.TypeId, FernIr.TypeDeclaration>;
}): FernIr.ExampleTypeReference | undefined {
    const primitiveType = resolveToPrimitive({ typeReference: pathParameter.valueType, types });
    if (primitiveType == null) {
        return undefined;
    }
    return getPlaceholderForPrimitive({
        primitiveType,
        fieldName: getOriginalName(pathParameter.name)
    });
}

function resolveToPrimitive({
    typeReference,
    types
}: {
    typeReference: FernIr.TypeReference;
    types: Record<FernIr.TypeId, FernIr.TypeDeclaration>;
}): FernIr.PrimitiveType | undefined {
    switch (typeReference.type) {
        case "primitive":
            return typeReference.primitive;
        case "named": {
            const shape = types[typeReference.typeId]?.shape;
            return shape?.type === "alias" ? resolveToPrimitive({ typeReference: shape.aliasOf, types }) : undefined;
        }
        case "container":
        case "unknown":
            return undefined;
        default:
            assertNever(typeReference);
    }
}

function getPlaceholderForPrimitive({
    primitiveType,
    fieldName
}: {
    primitiveType: FernIr.PrimitiveType;
    fieldName: string;
}): FernIr.ExampleTypeReference {
    switch (primitiveType.v1) {
        case "STRING":
            return exampleTypeReference(FernIr.ExamplePrimitive.string({ original: fieldName }), fieldName);
        case "BASE_64":
            return exampleTypeReference(FernIr.ExamplePrimitive.base64(Examples.BASE64), Examples.BASE64);
        case "BOOLEAN":
            return exampleTypeReference(FernIr.ExamplePrimitive.boolean(Examples.BOOLEAN), Examples.BOOLEAN);
        case "DATE":
            return exampleTypeReference(FernIr.ExamplePrimitive.date(Examples.DATE), Examples.DATE);
        case "DATE_TIME":
            return exampleTypeReference(
                FernIr.ExamplePrimitive.datetime({ datetime: new Date(Examples.DATE_TIME), raw: Examples.DATE_TIME }),
                Examples.DATE_TIME
            );
        case "DATE_TIME_RFC_2822":
            return exampleTypeReference(
                FernIr.ExamplePrimitive.datetimeRfc2822({
                    datetime: new Date(Examples.DATE_TIME_RFC_2822),
                    raw: Examples.DATE_TIME_RFC_2822
                }),
                Examples.DATE_TIME_RFC_2822
            );
        case "UUID":
            return exampleTypeReference(FernIr.ExamplePrimitive.uuid(Examples.UUID), Examples.UUID);
        case "BIG_INTEGER":
            return exampleTypeReference(FernIr.ExamplePrimitive.bigInteger(Examples.BIG_INTEGER), Examples.BIG_INTEGER);
        case "DOUBLE":
            return exampleTypeReference(FernIr.ExamplePrimitive.double(Examples.DOUBLE), Examples.DOUBLE);
        case "FLOAT":
            return exampleTypeReference(FernIr.ExamplePrimitive.float(Examples.FLOAT), Examples.FLOAT);
        case "INTEGER":
            return exampleTypeReference(FernIr.ExamplePrimitive.integer(Examples.INT), Examples.INT);
        case "UINT":
            return exampleTypeReference(FernIr.ExamplePrimitive.uint(Examples.UINT), Examples.UINT);
        case "UINT_64":
            return exampleTypeReference(FernIr.ExamplePrimitive.uint64(Examples.UINT64), Examples.UINT64);
        case "LONG":
            return exampleTypeReference(FernIr.ExamplePrimitive.long(Examples.INT64), Examples.INT64);
        default:
            assertNever(primitiveType.v1);
    }
}

function exampleTypeReference(primitive: FernIr.ExamplePrimitive, jsonExample: unknown): FernIr.ExampleTypeReference {
    return {
        shape: FernIr.ExampleTypeReferenceShape.primitive(primitive),
        jsonExample
    };
}
