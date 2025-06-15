import { go } from "@fern-api/go-ast";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): go.Type | undefined {
    if (endpoint.response?.body == null) {
        return undefined;
    }
    return endpoint.response.body._visit({
        bytes: () => go.Type.bytes(),
        streamParameter: () => undefined, // Stream parameter is not supported.
        fileDownload: () => undefined, // TODO: Return io.Reader here.
        json: (reference) => {
            return context.goTypeMapper.convert({ reference: reference.responseBodyType });
        },
        streaming: () => undefined, // TODO: Return core.Stream[Type] here.
        text: () => go.Type.string(),
        _other: () => undefined
    });
}
