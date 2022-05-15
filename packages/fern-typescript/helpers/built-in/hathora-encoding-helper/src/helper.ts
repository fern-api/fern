import { EncodeMethod, FernTypescriptHelper, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
import { ENCODER_NAME } from "./constants";
import { getMethodForModelTypeVariableReference } from "./getMethodForModelTypeVariableReference";
import { getMethodForWireMessageVariableReference } from "./getMethodForWireMessageVariableReference";
import { assertNever } from "./utils";
import { writeEncoder } from "./writeEncoder";

export const helper: FernTypescriptHelper = {
    encodings: {
        hathora: {
            _type: "fileBased",
            name: ENCODER_NAME,
            contentType: "application/octet-stream",
            writeEncoder: ({ encoderDirectory, tsMorph, modelDirectory, intermediateRepresentation }) => {
                const file = encoderDirectory.createSourceFile(`${ENCODER_NAME}.ts`);
                writeEncoder({ intermediateRepresentation, tsMorph, file, modelDirectory });
            },
            generateEncode: ({ referenceToDecodedObject, referenceToEncoder, tsMorph: { ts } }) => {
                return getMethodForVariableReference({
                    variableReference: referenceToDecodedObject,
                    referenceToEncoder,
                    ts,
                    method: "encode",
                });
            },
            generateDecode: ({ referenceToEncodedBuffer, referenceToEncoder, tsMorph: { ts } }) => {
                return getMethodForVariableReference({
                    variableReference: referenceToEncodedBuffer,
                    referenceToEncoder,
                    ts,
                    method: "decode",
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
            return getMethodForWireMessageVariableReference({ variableReference, referenceToEncoder, ts, method });
        case "modelType":
            return getMethodForModelTypeVariableReference({ variableReference, referenceToEncoder, ts, method });
        default:
            assertNever(variableReference);
    }
}
