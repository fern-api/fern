import { EncodeMethod, FernTypescriptHelper, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
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
            writeEncoder: ({ encoderDirectory, tsMorph, modelDirectory, intermediateRepresentation }) => {
                const file = encoderDirectory.createSourceFile(`${HathoraEncoderConstants.NAME}.ts`);
                writeEncoder({ intermediateRepresentation, tsMorph, file, modelDirectory });
            },
            generateEncode: ({ referenceToDecodedObject, referenceToEncoder, tsMorph: { ts } }) => {
                return getMethodForVariableReference({
                    variableReference: referenceToDecodedObject,
                    referenceToEncoder,
                    ts,
                    method: EncodeMethod.Encode,
                });
            },
            generateDecode: ({ referenceToEncodedBuffer, referenceToEncoder, tsMorph: { ts } }) => {
                return getMethodForVariableReference({
                    variableReference: referenceToEncodedBuffer,
                    referenceToEncoder,
                    ts,
                    method: EncodeMethod.Decode,
                });
            },
        },
    },
};

function getMethodForVariableReference({
    variableReference,
    referenceToEncoder,
    ts,
    method,
}: {
    variableReference: VariableReference;
    referenceToEncoder: tsMorph.ts.Expression;
    ts: typeof tsMorph.ts;
    method: EncodeMethod;
}): tsMorph.ts.CallExpression {
    switch (variableReference._type) {
        case "wireMessage":
            return getMethodCallForWireMessageVariableReference({ variableReference, referenceToEncoder, ts, method });
        case "modelType":
            return getMethodCallForModelTypeVariableReference({ variableReference, referenceToEncoder, ts, method });
        default:
            assertNever(variableReference);
    }
}
