import { assertNever } from '@fern-api/core-utils'
import { go } from '@fern-api/go-ast'

import { HttpEndpoint } from '@fern-fern/ir-sdk/api'

import { SdkGeneratorContext } from '../../SdkGeneratorContext'

export function getEndpointReturnZeroValues({
    context,
    endpoint
}: {
    context: SdkGeneratorContext
    endpoint: HttpEndpoint
}): go.TypeInstantiation | undefined {
    const response = endpoint.response
    if (response?.body == null) {
        return undefined
    }
    const body = response.body
    switch (body.type) {
        case 'json':
            return context.goZeroValueMapper.convert({ reference: body.value.responseBodyType })
        case 'text':
            return go.TypeInstantiation.string('')
        case 'bytes':
        case 'streamParameter':
        case 'fileDownload':
        case 'streaming':
            return go.TypeInstantiation.nil()
        default:
            assertNever(body)
    }
}
