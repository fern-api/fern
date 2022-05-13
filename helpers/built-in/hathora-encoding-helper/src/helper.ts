import { EncodeMethod, FernTypescriptHelper, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
import { getMethodForModelTypeVariableReference } from "./getMethodForModelTypeVariableReference";
import { getMethodForWireMessageVariableReference } from "./getMethodForWireMessageVariableReference";
import { assertNever } from "./utils";

const NAME = "HathoraEncoder";

export const helper: FernTypescriptHelper = {
    encodings: {
        hathora: {
            _type: "fileBased",
            name: NAME,
            contentType: "application/octet-stream",
            writeEncoder: ({ encoderDirectory, tsMorph }) => {
                const sourceFile = encoderDirectory.createSourceFile(`${NAME}.ts`);
                sourceFile.addVariableStatement({
                    declarationKind: tsMorph.VariableDeclarationKind.Const,
                    declarations: [
                        {
                            name: NAME,
                            type: "any",
                            initializer: "undefined",
                        },
                    ],
                    isExported: true,
                });
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
