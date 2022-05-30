import { EncodeMethod, FernTypescriptHelper, TsMorph, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
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
            writeEncoder: ({ encoderDirectory, tsMorph, modelDirectory, intermediateRepresentation, typeResolver }) => {
                const file = encoderDirectory.createSourceFile(`${HathoraEncoderConstants.NAME}.ts`);
                writeEncoder({ intermediateRepresentation, tsMorph, file, modelDirectory, typeResolver });
            },
            generateEncode: ({ referenceToDecodedObject, referenceToEncoder, tsMorph: { ts } }) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        getMethodCallForVariableReference({
                            variableReference: referenceToDecodedObject,
                            referenceToEncoder,
                            ts,
                            method: EncodeMethod.Encode,
                        }),
                        ts.factory.createIdentifier("toBuffer")
                    ),
                    undefined,
                    undefined
                );
            },
            generateDecode: ({ referenceToEncodedBuffer, referenceToEncoder, tsMorph: { ts } }) => {
                return getMethodCallForVariableReference({
                    variableReference: referenceToEncodedBuffer,
                    referenceToEncoder,
                    ts,
                    method: EncodeMethod.Decode,
                });
            },
        },
    },
};

function getMethodCallForVariableReference({
    variableReference,
    referenceToEncoder,
    ts,
    method,
}: {
    variableReference: VariableReference;
    referenceToEncoder: tsMorph.ts.Expression;
    ts: TsMorph["ts"];
    method: EncodeMethod;
}): tsMorph.ts.CallExpression {
    switch (variableReference._type) {
        case "wireMessage":
            return getMethodCallForWireMessageVariableReference({ variableReference, referenceToEncoder, ts, method });
        case "modelType":
            return getMethodCallForModelTypeVariableReference({
                typeReference: variableReference.typeReference,
                referenceToEncoder,
                ts,
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
    variable: tsMorph.ts.Expression;
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
