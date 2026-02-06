import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): php.Type | undefined {
    if (endpoint.response?.body == null) {
        return undefined;
    }
    return endpoint.response.body._visit({
        bytes: () => undefined,
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
