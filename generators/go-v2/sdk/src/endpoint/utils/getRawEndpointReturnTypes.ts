import { go } from "@fern-api/go-ast";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getRawEndpointReturnTypes({
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
        bytes: () => wrapWithRawResponseType({ context, returnType: go.Type.bytes() }),
        fileDownload: () =>
            wrapWithRawResponseType({
                context,
                returnType: go.Type.reference(context.getIoReaderTypeReference())
            }),
        json: (reference) => {
            return wrapWithRawResponseType({
                context,
                returnType: context.goTypeMapper.convert({ reference: reference.responseBodyType })
            });
        },
        text: () => wrapWithRawResponseType({ context, returnType: go.Type.string() }),
        streaming: (reference) =>
            go.Type.reference(context.getStreamTypeReference(context.getStreamPayload(reference))),
        streamParameter: () => go.Type.any(),
        _other: () => go.Type.any()
    });
    return [returnType, go.Type.error()];
}

function wrapWithRawResponseType({
    context,
    returnType
}: {
    context: SdkGeneratorContext;
    returnType: go.Type;
}): go.Type {
    return go.Type.pointer(go.Type.reference(context.getRawResponseTypeReference(returnType)));
}
