import { ts } from "@fern-api/typescript-ast";

import { SdkRequest } from "@fern-fern/ir-sdk/api";

export function sdkRequestMapper(sdkRequest?: SdkRequest) {
    return sdkRequest?.shape._visit({
        justRequestBody: (value) =>
            value._visit({
                typeReference: (value) =>
                    value.requestBodyType._visit({
                        container: () => undefined,
                        named: (value) => value,
                        primitive: () => undefined,
                        unknown: () => undefined,
                        _other: () => undefined
                    }),
                bytes: () => undefined,
                _other: () => undefined
            }),
        wrapper: () => undefined,
        _other: () => undefined
    });
}
