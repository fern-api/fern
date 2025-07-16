import { assertNever } from "@fern-api/core-utils"
import { go } from "@fern-api/go-ast"

import { HttpEndpoint } from "@fern-fern/ir-sdk/api"

import { SdkGeneratorContext } from "../../SdkGeneratorContext"

export function getEndpointReturnTypes({
    context,
    endpoint
}: {
    context: SdkGeneratorContext
    endpoint: HttpEndpoint
}): go.Type | undefined {
    const response = endpoint.response
    if (response?.body == null) {
        return undefined
    }
    const body = response.body
    switch (body.type) {
        case "bytes":
            return go.Type.bytes()
        case "streamParameter":
            return go.Type.any()
        case "fileDownload":
            return go.Type.reference(context.getIoReaderTypeReference())
        case "json":
            return context.goTypeMapper.convert({ reference: body.value.responseBodyType })
        case "streaming":
            return go.Type.reference(context.getStreamTypeReference(context.getStreamPayload(body.value)))
        case "text":
            return go.Type.string()
        default:
            assertNever(body)
    }
}
