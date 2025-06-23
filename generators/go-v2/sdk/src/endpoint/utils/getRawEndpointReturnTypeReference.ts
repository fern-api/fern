import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getRawEndpointReturnTypeReference({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): go.TypeReference {
    const response = endpoint.response;
    if (response?.body == null) {
        return wrapWithRawResponseType({ context, returnType: go.Type.any() });
    }
    const body = response.body;
    switch (body.type) {
        case "bytes":
            return wrapWithRawResponseType({ context, returnType: go.Type.bytes() });
        case "fileDownload":
            return wrapWithRawResponseType({
                context,
                returnType: go.Type.reference(context.getIoReaderTypeReference())
            });
        case "json":
            return wrapWithRawResponseType({
                context,
                returnType: context.goTypeMapper.convert({ reference: body.value.responseBodyType })
            });
        case "streaming":
            return wrapWithRawResponseType({
                context,
                returnType: go.Type.reference(context.getStreamTypeReference(context.getStreamPayload(body.value)))
            });
        case "streamParameter":
            return context.getRawResponseTypeReference(go.Type.any());
        case "text":
            return wrapWithRawResponseType({ context, returnType: go.Type.string() });
        default:
            assertNever(body);
    }
}

function wrapWithRawResponseType({
    context,
    returnType
}: {
    context: SdkGeneratorContext;
    returnType: go.Type;
}): go.TypeReference {
    return context.getRawResponseTypeReference(returnType);
}
