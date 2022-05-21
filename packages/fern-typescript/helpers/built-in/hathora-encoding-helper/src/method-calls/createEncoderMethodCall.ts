import { EncodeMethod, TsMorph, tsMorph } from "@fern-typescript/helper-utils";

export function createEncoderMethodCall({
    ts,
    referenceToEncoder,
    propertyChainToMethod,
    method,
    args,
}: {
    ts: TsMorph["ts"];
    referenceToEncoder: tsMorph.ts.Expression;
    propertyChainToMethod: readonly string[];
    method: EncodeMethod;
    args: readonly tsMorph.ts.Expression[];
}): tsMorph.ts.CallExpression {
    return ts.factory.createCallExpression(
        createReferenceToEncoderMethod({ ts, referenceToEncoder, propertyChain: [...propertyChainToMethod, method] }),
        undefined,
        args
    );
}

function createReferenceToEncoderMethod({
    ts,
    referenceToEncoder,
    propertyChain,
}: {
    ts: TsMorph["ts"];
    referenceToEncoder: tsMorph.ts.Expression;
    propertyChain: readonly string[];
}): tsMorph.ts.Expression {
    return propertyChain.reduce(
        (referenceToMethod, property) => ts.factory.createPropertyAccessExpression(referenceToMethod, property),
        referenceToEncoder
    );
}
