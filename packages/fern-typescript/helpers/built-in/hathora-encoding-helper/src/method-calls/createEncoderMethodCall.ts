import { EncodeMethod, TsMorph, tsMorph } from "@fern-typescript/helper-utils";

export function createEncoderMethodCall({
    ts,
    referenceToEncoder,
    propertyChainToMethod,
    method,
    variable,
}: {
    ts: TsMorph["ts"];
    referenceToEncoder: tsMorph.ts.Expression;
    propertyChainToMethod: readonly string[];
    method: EncodeMethod;
    variable: tsMorph.ts.Expression;
}): tsMorph.ts.CallExpression {
    const encoderCall = ts.factory.createCallExpression(
        createReferenceToEncoderMethod({ ts, referenceToEncoder, propertyChain: [...propertyChainToMethod, method] }),
        undefined,
        [variable]
    );
    switch (method) {
        case "decode":
            return encoderCall;
        case "encode":
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(encoderCall, ts.factory.createIdentifier("toBuffer")),
                undefined,
                undefined
            );
    }
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
