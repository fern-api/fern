import { ClientConstants } from "@fern-typescript/client";
import { EncodeMethod, ts, VariableReference } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../constants";
import { assertNever } from "../utils/assertNever";
import { createEncoderMethodCall } from "./createEncoderMethodCall";

export function getMethodCallForWireMessageVariableReference({
    variableReference,
    method,
    referenceToEncoder,
}: {
    variableReference: VariableReference.WireMessageBodyReference;
    method: EncodeMethod;
    referenceToEncoder: ts.Expression;
}): ts.CallExpression {
    return createEncoderMethodCall({
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
            return ClientConstants.HttpService.Endpoint.Types.Request.Properties.Body.TYPE_NAME;
        case "Response":
            return ClientConstants.Commons.Types.Response.Success.Properties.Body.TYPE_NAME;
        case "Error":
            return ClientConstants.Commons.Types.Response.Error.Properties.Body.TYPE_NAME;
        default:
            assertNever(wireMessageType);
    }
}
