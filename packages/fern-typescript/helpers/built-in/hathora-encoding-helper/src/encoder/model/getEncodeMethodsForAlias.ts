import { AliasTypeDefinition, TypeDefinition } from "@fern-api/api";
import { generateTypeUtilsReference, SourceFileManager } from "@fern-typescript/commons";
import { ts, tsMorph } from "@fern-typescript/helper-utils";
import { ALIAS_UTILS_OF_KEY, shouldUseBrandedTypeForAlias } from "@fern-typescript/model";
import { HathoraEncoderConstants } from "../../constants";
import { getMethodCallForModelTypeVariableReference } from "../../method-calls/getMethodCallForModelTypeVariableReference";
import {
    BIN_SERDE_READER_VARIABLE_NAME,
    BIN_SERDE_WRITER_VARIABLE_NAME,
    EncodeMethods,
    ENCODE_PARAMETER_NAME,
    SimpleFunctionBody,
} from "../constructEncodeMethods";

export function getEncodeMethodsForAlias({
    typeDefinition,
    shape,
    decodedType,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    shape: AliasTypeDefinition;
    decodedType: ts.TypeNode;
    file: SourceFileManager;
    modelDirectory: tsMorph.Directory;
}): EncodeMethods {
    return {
        decodedType,
        encode: {
            statements: [
                ts.factory.createReturnStatement(
                    getMethodCallForModelTypeVariableReference({
                        typeReference: shape.aliasOf,
                        referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
                        args: {
                            method: "encode",
                            variableToEncode: ts.factory.createIdentifier(ENCODE_PARAMETER_NAME),
                            binSerdeWriter: ts.factory.createIdentifier(BIN_SERDE_WRITER_VARIABLE_NAME),
                        },
                    })
                ),
            ],
        },
        decode: generateDecode({ typeDefinition, shape, file, modelDirectory }),
    };
}

export function generateDecode({
    typeDefinition,
    shape,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    shape: AliasTypeDefinition;
    file: SourceFileManager;
    modelDirectory: tsMorph.Directory;
}): SimpleFunctionBody {
    let decodeCall: ts.Expression = getMethodCallForModelTypeVariableReference({
        typeReference: shape.aliasOf,
        referenceToEncoder: ts.factory.createIdentifier(HathoraEncoderConstants.NAME),
        args: {
            method: "decode",
            bufferOrBinSerdeReader: ts.factory.createIdentifier(BIN_SERDE_READER_VARIABLE_NAME),
        },
    });

    if (shouldUseBrandedTypeForAlias(shape)) {
        decodeCall = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                generateTypeUtilsReference({ typeDefinition, referencedIn: file, modelDirectory }),
                ts.factory.createIdentifier(ALIAS_UTILS_OF_KEY)
            ),
            undefined,
            [decodeCall]
        );
    }

    return {
        statements: [ts.factory.createReturnStatement(decodeCall)],
    };
}
