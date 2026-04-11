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
        bytes: () => php.Type.string(),
        streamParameter: () => undefined,
        fileDownload: () => php.Type.string(),
        json: (reference) => {
            const type = context.phpTypeMapper.convert({ reference: reference.responseBodyType });
            return type.isOptional() ? type : php.Type.optional(type);
        },
        streaming: () => undefined,
        text: () => php.Type.string(),
        _other: () => undefined
    });
}
