import { rust } from "@fern-api/rust-codegen";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): rust.Type | undefined {
    if (endpoint.response?.body == null) {
        return undefined;
    }
    return endpoint.response.body._visit({
        bytes: () => undefined,
        streamParameter: () => undefined,
        fileDownload: () => undefined,
        json: (reference) => {
            return context.rustTypeMapper.convert({ reference: reference.responseBodyType });
        },
        streaming: () => undefined,
        text: () => rust.Type.string(),
        _other: () => undefined
    });
}
