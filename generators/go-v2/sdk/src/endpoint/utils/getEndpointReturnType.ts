import { go } from "@fern-api/go-ast";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { getResponseBodyType } from "./getResponseBodyType.js";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): go.Type | undefined {
    const response = endpoint.response;
    if (response?.body == null) {
        return undefined;
    }
    return getResponseBodyType({ context, body: response.body });
}
