import { TypeReference } from "@fern-api/api";
import { EncodeMethod, TsMorph, tsMorph } from "@fern-typescript/helper-utils";
import { getEncoderNameForContainer, getEncoderNameForPrimitive, HathoraEncoderConstants } from "../constants";
import { createEncoderMethodCall } from "./createEncoderMethodCall";

export function getMethodCallForModelTypeVariableReference({
    ts,
    typeReference,
    method,
    referenceToEncoder,
    args,
}: {
    ts: TsMorph["ts"];
    typeReference: TypeReference;
    method: EncodeMethod;
    referenceToEncoder: tsMorph.ts.Expression;
    args: readonly tsMorph.ts.Expression[];
}): tsMorph.ts.CallExpression {
    return createEncoderMethodCall({
        ts,
        referenceToEncoder,
        propertyChainToMethod: createMethodReferencePropertyChain(typeReference),
        method,
        args,
    });
}

function createMethodReferencePropertyChain(typeReference: TypeReference): string[] {
    return TypeReference._visit<string[]>(typeReference, {
        named: ({ name }) => [HathoraEncoderConstants.Model.NAME, name],
        primitive: (primitive) => [HathoraEncoderConstants.Primitives.NAME, getEncoderNameForPrimitive(primitive)],
        container: (container) => [
            HathoraEncoderConstants.Containers.NAME,
            getEncoderNameForContainer(container._type),
        ],
        void: () => {
            throw new Error("Cannot encode/decode void");
        },
        _unknown: () => {
            throw new Error("Unknown type reference: " + typeReference._type);
        },
    });
}
