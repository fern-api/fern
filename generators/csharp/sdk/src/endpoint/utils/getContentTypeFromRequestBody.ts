import { HttpEndpoint } from '@fern-fern/ir-sdk/api'

export function getContentTypeFromRequestBody(endpoint: HttpEndpoint): string | undefined {
    if (!endpoint.requestBody) {
        return undefined
    }
    return endpoint.requestBody._visit<string | undefined>({
        inlinedRequestBody: (body) => body.contentType,
        reference: (body) => body.contentType,
        fileUpload: (_) => undefined,
        bytes: (body) => body.contentType,
        _other: (body) => {
            throw new Error(`Unexpected request body type: ${body.type}`)
        }
    })
}
