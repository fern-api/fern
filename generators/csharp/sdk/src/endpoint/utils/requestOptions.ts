import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { csharp } from "@fern-api/csharp-codegen";

export function getRequestOptionsParameter({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): csharp.Parameter {
    const name = getRequestOptionsParamNameForEndpoint({ context, endpoint });
    if (endpoint.idempotent) {
        return csharp.parameter({
            type: csharp.Type.optional(csharp.Type.reference(context.getIdempotentRequestOptionsClassReference())),
            name,
            initializer: "null"
        });
    } else {
        return csharp.parameter({
            type: csharp.Type.optional(csharp.Type.reference(context.getRequestOptionsClassReference())),
            name,
            initializer: "null"
        });
    }
}

export function getRequestOptionsParamNameForEndpoint({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): string {
    if (endpoint.idempotent) {
        return context.getIdempotentRequestOptionsParameterName();
    } else {
        return context.getRequestOptionsParameterName();
    }
}
