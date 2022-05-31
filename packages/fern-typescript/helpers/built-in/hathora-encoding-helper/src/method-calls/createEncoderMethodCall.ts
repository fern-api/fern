import { EncodeMethod, ts } from "@fern-typescript/helper-utils";

export function createEncoderMethodCall({
    referenceToEncoder,
    propertyChainToMethod,
    method,
    args,
}: {
    referenceToEncoder: ts.Expression;
    propertyChainToMethod: readonly string[];
    method: EncodeMethod;
    args: readonly ts.Expression[];
}): ts.CallExpression {
    return ts.factory.createCallExpression(
        createReferenceToEncoderMethod({ referenceToEncoder, propertyChain: [...propertyChainToMethod, method] }),
        undefined,
        args
    );
}

function createReferenceToEncoderMethod({
    referenceToEncoder,
    propertyChain,
}: {
    referenceToEncoder: ts.Expression;
    propertyChain: readonly string[];
}): ts.Expression {
    return propertyChain.reduce(
        (referenceToMethod, property) => ts.factory.createPropertyAccessExpression(referenceToMethod, property),
        referenceToEncoder
    );
}
