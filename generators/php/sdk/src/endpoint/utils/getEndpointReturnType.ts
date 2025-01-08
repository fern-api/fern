import { php } from "@fern-api/php-codegen";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): php.Type | undefined {
    if (endpoint.response?.body == null) {
        return undefined;
    }
    return endpoint.response.body._visit({
        streamParameter: () => undefined,
        fileDownload: () => undefined,
        json: (reference) => {
            return context.phpTypeMapper.convert({ reference: reference.responseBodyType });
        },
        streaming: () => undefined,
        text: () => php.Type.string(),
        _other: () => undefined
    });
}
