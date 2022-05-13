import { EncodeMethod, tsTypes } from "@fern-typescript/helper-utils";

export function assertNever(x: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(x));
}

export function createEncoderMethodCall({
    ts,
    referenceToEncoder,
    propertyChainToMethod,
    method,
    variable,
}: {
    ts: typeof tsTypes;
    referenceToEncoder: tsTypes.Expression;
    propertyChainToMethod: readonly string[];
    method: EncodeMethod;
    variable: tsTypes.Expression;
}): tsTypes.CallExpression {
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
    ts: typeof tsTypes;
    referenceToEncoder: tsTypes.Expression;
    propertyChain: readonly string[];
}): tsTypes.Expression {
    return propertyChain.reduce(
        (referenceToMethod, property) => ts.factory.createPropertyAccessExpression(referenceToMethod, property),
        referenceToEncoder
    );
}
