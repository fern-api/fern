import { ClientConstants } from "@fern-typescript/client";
import { EncodeMethod, TsMorph, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../constants";
import { assertNever } from "../utils/assertNever";
import { createEncoderMethodCall } from "./createEncoderMethodCall";

export function getMethodCallForWireMessageVariableReference({
    variableReference,
    ts,
    method,
    referenceToEncoder,
}: {
    variableReference: VariableReference.WireMessageBodyReference;
    ts: TsMorph["ts"];
    method: EncodeMethod;
    referenceToEncoder: tsMorph.ts.Expression;
}): tsMorph.ts.CallExpression {
    return createEncoderMethodCall({
        ts,
        referenceToEncoder,
        method,
        propertyChainToMethod: [
            HathoraEncoderConstants.Services.NAME,
            variableReference.serviceName,
            variableReference.endpointId,
            getBodyTypeNameFromWireMessageType(variableReference.wireMessageType),
        ],
        args: [variableReference.variable],
    });
}

function getBodyTypeNameFromWireMessageType(
    wireMessageType: VariableReference.WireMessageBodyReference["wireMessageType"]
): string {
    switch (wireMessageType) {
        case "Request":
            return ClientConstants.Service.Endpoint.Types.Request.Properties.Body.TYPE_NAME;
        case "Response":
            return ClientConstants.Service.Endpoint.Types.Response.Success.Properties.Body.TYPE_NAME;
        case "Error":
            return ClientConstants.Service.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME;
        default:
            assertNever(wireMessageType);
    }
}
