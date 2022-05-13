import { ClientConstants } from "@fern-typescript/client";
import { EncodeMethod, tsMorph, VariableReference } from "@fern-typescript/helper-utils";
import { assertNever, createEncoderMethodCall } from "./utils";

export function getMethodForWireMessageVariableReference({
    variableReference,
    ts,
    method,
    referenceToEncoder,
}: {
    variableReference: VariableReference.WireMessageBodyReference;
    ts: typeof tsMorph.ts;
    method: EncodeMethod;
    referenceToEncoder: tsMorph.ts.Expression;
}): tsMorph.ts.CallExpression {
    return createEncoderMethodCall({
        ts,
        referenceToEncoder,
        method,
        variable: variableReference.variable,
        propertyChainToMethod: [
            "Services",
            variableReference.serviceName,
            variableReference.endpointId,
            getBodyTypeNameFromWireMessageType(variableReference.wireMessageType),
        ],
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
