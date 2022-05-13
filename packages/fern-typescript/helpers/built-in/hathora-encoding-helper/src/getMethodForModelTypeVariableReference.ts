import { EncodeMethod, tsTypes, VariableReference } from "@fern-typescript/helper-utils";
import { assertNever, createEncoderMethodCall } from "./utils";

export function getMethodForModelTypeVariableReference({
    variableReference,
    ts,
    method,
    referenceToEncoder,
}: {
    variableReference: VariableReference.ModelReference;
    ts: typeof tsTypes;
    method: EncodeMethod;
    referenceToEncoder: tsTypes.Expression;
}): tsTypes.CallExpression {
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
