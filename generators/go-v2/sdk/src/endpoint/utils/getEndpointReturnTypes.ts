import { go } from "@fern-api/go-ast";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnTypes({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): go.Type[] {
    if (endpoint.response?.body == null) {
        return [go.Type.error()];
    }
    const returnType = endpoint.response?.body._visit({
        bytes: () => go.Type.bytes(),
        streamParameter: () => go.Type.any(),
        fileDownload: () => go.Type.reference(context.getIoReaderTypeReference()),
        json: (reference) => {
            return context.goTypeMapper.convert({ reference: reference.responseBodyType });
        },
        streaming: () => go.Type.any(), // TODO: Return core.Stream[Type] here.
        text: () => go.Type.string(),
        _other: () => go.Type.any()
    });
    return [returnType, go.Type.error()];
}
