import { EncodeMethod, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
import { assertNever, createEncoderMethodCall } from "./utils";

export function getMethodForModelTypeVariableReference({
    variableReference,
    ts,
    method,
    referenceToEncoder,
}: {
    variableReference: VariableReference.ModelReference;
    ts: typeof tsMorph.ts;
    method: EncodeMethod;
    referenceToEncoder: tsMorph.ts.Expression;
}): tsMorph.ts.CallExpression {
    return createEncoderMethodCall({
        ts,
        referenceToEncoder,
        propertyChainToMethod: createMethodReferencePropertyChain(variableReference),
        method,
        variable: variableReference.variable,
    });
}

function createMethodReferencePropertyChain(variableReference: VariableReference.ModelReference): string[] {
    switch (variableReference.typeReference._type) {
        case "named":
            return ["Model", variableReference.typeReference.name];
        case "primitive":
            return ["Primitives", variableReference.typeReference.primitive];
        default:
            assertNever(variableReference.typeReference);
    }
}
