import { EncodeMethod, tsMorph } from "@fern-typescript/helper-utils";

export function createEncoderMethodCall({
    ts,
    referenceToEncoder,
    propertyChainToMethod,
    method,
    variable,
}: {
    ts: typeof tsMorph.ts;
    referenceToEncoder: tsMorph.ts.Expression;
    propertyChainToMethod: readonly string[];
    method: EncodeMethod;
    variable: tsMorph.ts.Expression;
}): tsMorph.ts.CallExpression {
    return ts.factory.createCallExpression(
        createReferenceToEncoderMethod({ ts, referenceToEncoder, propertyChain: [...propertyChainToMethod, method] }),
        undefined,
        [variable]
    );
}

function createReferenceToEncoderMethod({
    ts,
    referenceToEncoder,
    propertyChain,
}: {
    ts: typeof tsMorph.ts;
    referenceToEncoder: tsMorph.ts.Expression;
    propertyChain: readonly string[];
}): tsMorph.ts.Expression {
    return propertyChain.reduce(
        (referenceToMethod, property) => ts.factory.createPropertyAccessExpression(referenceToMethod, property),
        referenceToEncoder
    );
}
