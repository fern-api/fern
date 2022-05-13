import { EncodeMethod, FernTypescriptHelper, tsTypes, VariableReference } from "@fern-typescript/helper-utils";
import { getMethodForModelTypeVariableReference } from "./getMethodForModelTypeVariableReference";
import { getMethodForWireMessageVariableReference } from "./getMethodForWireMessageVariableReference";
import { assertNever } from "./utils";

export const helper: FernTypescriptHelper = {
    encodings: {
        hathora: {
            _type: "fileBased",
            name: "HathoraEncoder",
            contentType: "application/octet-stream",
            writeEncoder: () => {
                // TODO
            },
            generateEncode: ({ referenceToDecodedObject, referenceToEncoder, ts }) => {
                return getMethodForVariableReference({
                    variableReference: referenceToDecodedObject,
                    referenceToEncoder,
                    ts,
                    method: "encode",
                });
            },
            generateDecode: ({ referenceToEncodedBuffer, referenceToEncoder, ts }) => {
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
    referenceToEncoder: tsTypes.Expression;
    ts: typeof tsTypes;
    method: EncodeMethod;
}): tsTypes.CallExpression {
    switch (variableReference._type) {
        case "wireMessage":
            return getMethodForWireMessageVariableReference({ variableReference, referenceToEncoder, ts, method });
        case "modelType":
            return getMethodForModelTypeVariableReference({ variableReference, referenceToEncoder, ts, method });
        default:
            assertNever(variableReference);
    }
}
