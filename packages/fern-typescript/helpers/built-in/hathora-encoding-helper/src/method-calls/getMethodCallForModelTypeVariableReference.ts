import { EncodeMethod, TsMorph, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../constants";
import { getEncoderNameForPrimitive } from "../encoder/writePrimitives";
import { assertNever } from "../utils/assertNever";
import { createEncoderMethodCall } from "./createEncoderMethodCall";

export function getMethodCallForModelTypeVariableReference({
    variableReference,
    ts,
    method,
    referenceToEncoder,
}: {
    variableReference: VariableReference.ModelReference;
    ts: TsMorph["ts"];
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
            return [HathoraEncoderConstants.Model.NAME, variableReference.typeReference.name];
        case "primitive":
            return [
                HathoraEncoderConstants.Primitives.NAME,
                getEncoderNameForPrimitive(variableReference.typeReference.primitive),
            ];
        default:
            assertNever(variableReference.typeReference);
    }
}
