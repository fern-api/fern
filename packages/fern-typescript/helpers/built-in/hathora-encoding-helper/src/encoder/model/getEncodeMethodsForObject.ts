import { ObjectProperty, ObjectTypeDefinition } from "@fern-api/api";
import { TypeResolver } from "@fern-typescript/commons";
import { ts } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../../constants";
import { getMethodCallForModelTypeVariableReference } from "../../method-calls/getMethodCallForModelTypeVariableReference";
import {
    BIN_SERDE_READER_VARIABLE_NAME,
    BIN_SERDE_WRITER_VARIABLE_NAME,
    EncodeMethods,
    ENCODE_PARAMETER_NAME,
} from "../constructEncodeMethods";

export function getEncodeMethodsForObject({
    object,
    typeResolver,
    decodedType,
}: {
    object: ObjectTypeDefinition;
    typeResolver: TypeResolver;
    decodedType: ts.TypeNode;
}): EncodeMethods {
    const properties = getAllProperties({ object, typeResolver });
    return {
        decodedType,
        encode: {
            statements: [
                ...properties.map((property) =>
                    ts.factory.createExpressionStatement(
                        getMethodCallForModelTypeVariableReference({
                            typeReference: property.valueType,
                            referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                            args: {
                                method: "encode",
                                variableToEncode: ts.factory.createElementAccessExpression(
                                    ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                                    ts.factory.createStringLiteral(property.key)
                                ),
                                binSerdeWriter: ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                            },
                        })
                    )
                ),
                ts.factory.createReturnStatement(ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME)),
            ],
        },
        decode: {
            statements: [
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        properties.map((property) =>
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(property.key),
                                getMethodCallForModelTypeVariableReference({
                                    typeReference: property.valueType,
                                    referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                                    args: {
                                        method: "decode",
                                        bufferOrBinSerdeReader:
                                            ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
                                    },
                                })
                            )
                        )
                    )
                ),
            ],
        },
    };
}

function getAllProperties({
    object,
    typeResolver,
}: {
    object: ObjectTypeDefinition;
    typeResolver: TypeResolver;
}): ObjectProperty[] {
    return [
        ...object.extends.flatMap((extending) => {
            const resolvedType = typeResolver.resolveTypeName(extending);
            if (resolvedType._type !== "object") {
                throw new Error("Cannot extend from non-object. Extending: " + resolvedType._type);
            }
            return getAllProperties({ object: resolvedType, typeResolver });
        }),
        ...object.properties,
    ];
}
