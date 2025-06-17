import { go } from "@fern-api/go-ast";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnZeroValues({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): go.TypeInstantiation[] {
    if (endpoint.response?.body == null) {
        return [go.TypeInstantiation.nil()];
    }
    const zeroValue = endpoint.response.body._visit({
        bytes: () => go.TypeInstantiation.nil(),
        streamParameter: () => go.TypeInstantiation.nil(),
        fileDownload: () => go.TypeInstantiation.nil(),
        json: (reference) => {
            return context.goZeroValueMapper.convert({ reference: reference.responseBodyType });
        },
        streaming: () => go.TypeInstantiation.nil(),
        text: () => go.TypeInstantiation.string(""),
        _other: () => go.TypeInstantiation.nil()
    });
    return [zeroValue, go.TypeInstantiation.nil()];
}
