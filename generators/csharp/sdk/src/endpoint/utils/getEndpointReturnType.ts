import { csharp } from "@fern-api/csharp-codegen"

import { FernIr } from "@fern-fern/ir-sdk"
import { HttpEndpoint } from "@fern-fern/ir-sdk/api"

import { SdkGeneratorContext } from "../../SdkGeneratorContext"

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext
    endpoint: HttpEndpoint
}): csharp.Type | undefined {
    if (endpoint.response?.body == null) {
        if (endpoint.method === FernIr.HttpMethod.Head) {
            return csharp.Type.reference(context.getHttpResponseHeadersReference())
        }
        return undefined
    }
    return endpoint.response.body._visit({
        streamParameter: () => undefined,
        fileDownload: () => undefined,
        json: (reference) => {
            return context.csharpTypeMapper.convert({ reference: reference.responseBodyType })
        },
        streaming: () => undefined,
        text: () => csharp.Type.string(),
        bytes: () => undefined,
        _other: () => undefined
    })
}
