import { assertNever } from '@fern-api/core-utils'
import { go } from '@fern-api/go-ast'

import { HttpEndpoint, JsonResponse } from '@fern-fern/ir-sdk/api'

import { SdkGeneratorContext } from '../../SdkGeneratorContext'

export function getRawEndpointReturnTypeReference({
    context,
    endpoint
}: {
    context: SdkGeneratorContext
    endpoint: HttpEndpoint
}): go.TypeReference {
    const response = endpoint.response
    if (response?.body == null) {
        return wrapWithRawResponseType({ context, returnType: go.Type.any() })
    }
    const body = response.body
    switch (body.type) {
        case 'bytes':
            return wrapWithRawResponseType({ context, returnType: go.Type.bytes() })
        case 'fileDownload':
            return wrapWithRawResponseType({
                context,
                returnType: go.Type.reference(context.getIoReaderTypeReference())
            })
        case 'json':
            return getRawEndpointReturnTypeReferenceJson({ context, responseBody: body.value })
        case 'streaming':
            return wrapWithRawResponseType({
                context,
                returnType: go.Type.reference(context.getStreamTypeReference(context.getStreamPayload(body.value)))
            })
        case 'streamParameter':
            return context.getRawResponseTypeReference(go.Type.any())
        case 'text':
            return wrapWithRawResponseType({ context, returnType: go.Type.string() })
        default:
            assertNever(body)
    }
}

function getRawEndpointReturnTypeReferenceJson({
    context,
    responseBody
}: {
    context: SdkGeneratorContext
    responseBody: JsonResponse
}): go.TypeReference {
    switch (responseBody.type) {
        case 'response':
            return context.getRawResponseTypeReference(
                context.goTypeMapper.convert({ reference: responseBody.responseBodyType })
            )
        case 'nestedPropertyAsResponse': {
            const typeReference =
                responseBody.responseProperty != null
                    ? responseBody.responseProperty.valueType
                    : responseBody.responseBodyType
            return context.getRawResponseTypeReference(context.goTypeMapper.convert({ reference: typeReference }))
        }
        default:
            assertNever(responseBody)
    }
}

function wrapWithRawResponseType({
    context,
    returnType
}: {
    context: SdkGeneratorContext
    returnType: go.Type
}): go.TypeReference {
    return context.getRawResponseTypeReference(returnType)
}
