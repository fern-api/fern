import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

import { getClientDefaultValue } from "./isLiteralHeader.js";

/**
 * Expression for a positional path parameter that an example does not supply. Examples leave out
 * parameters the client defaults, but the generated signature still requires an argument.
 */
export function getPathParameterExampleFallback(pathParameter: FernIr.PathParameter): ts.Expression {
    const clientDefault = getClientDefaultValue(pathParameter.clientDefault);
    if (typeof clientDefault === "string") {
        return ts.factory.createStringLiteral(clientDefault);
    }
    if (typeof clientDefault === "boolean") {
        return clientDefault ? ts.factory.createTrue() : ts.factory.createFalse();
    }
    return ts.factory.createIdentifier("undefined");
}
