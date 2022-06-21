import { EncodeMethod, FernTypescriptHelper, ts, VariableReference } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "./constants";
import { writeEncoder } from "./encoder/writeEncoder";
import { getMethodCallForModelTypeVariableReference } from "./method-calls/getMethodCallForModelTypeVariableReference";
import { getMethodCallForWireMessageVariableReference } from "./method-calls/getMethodCallForWireMessageVariableReference";
import { assertNever } from "./utils/assertNever";

export const helper: FernTypescriptHelper = {
    encodings: {
        hathora: {
            _type: "fileBased",
            name: HathoraEncoderConstants.NAME,
            contentType: "application/octet-stream",
            writeEncoder: ({ encoderDirectory, modelDirectory, intermediateRepresentation, typeResolver }) => {
                const file = encoderDirectory.createSourceFile(`${HathoraEncoderConstants.NAME}.ts`);
                writeEncoder({ intermediateRepresentation, file, modelDirectory, typeResolver });
            },
            generateEncode: ({ referenceToDecodedObject, referenceToEncoder }) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        getMethodCallForVariableReference({
                            variableReference: referenceToDecodedObject,
                            referenceToEncoder,
                            method: EncodeMethod.Encode,
                        }),
                        ts.factory.createIdentifier("toBuffer")
                    ),
                    undefined,
                    undefined
                );
            },
            generateDecode: ({ referenceToEncodedBuffer, referenceToEncoder }) => {
                return getMethodCallForVariableReference({
                    variableReference: referenceToEncodedBuffer,
                    referenceToEncoder,
                    method: EncodeMethod.Decode,
                });
            },
        },
    },
};

function getMethodCallForVariableReference({
    variableReference,
    referenceToEncoder,
    method,
}: {
    variableReference: VariableReference;
    referenceToEncoder: ts.Expression;
    method: EncodeMethod;
}): ts.CallExpression {
    switch (variableReference._type) {
        case "wireMessage":
            return getMethodCallForWireMessageVariableReference({ variableReference, referenceToEncoder, method });
        case "modelType":
            return getMethodCallForModelTypeVariableReference({
                typeReference: variableReference.typeReference,
                referenceToEncoder,
                args: getModelMethodCallArguments({ variable: variableReference.variable, method }),
            });
        default:
            assertNever(variableReference);
    }
}

function getModelMethodCallArguments({
    variable,
    method,
}: {
    variable: ts.Expression;
    method: EncodeMethod;
}): getMethodCallForModelTypeVariableReference.MethodCallArguments {
    switch (method) {
        case "encode":
            return {
                method: "encode",
                variableToEncode: variable,
                binSerdeWriter: undefined,
            };
        case "decode":
            return {
                method: "decode",
                bufferOrBinSerdeReader: variable,
            };
    }
}
