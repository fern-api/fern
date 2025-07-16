import { HttpEndpoint, HttpService, ServiceId } from '@fern-fern/ir-sdk/api'

import { SdkGeneratorContext } from '../../SdkGeneratorContext'
import { EndpointRequest } from '../request/EndpointRequest'
import { createEndpointRequest } from '../request/EndpointRequestFactory'

export function getEndpointRequest({
    context,
    endpoint,
    serviceId,
    service
}: {
    context: SdkGeneratorContext
    endpoint: HttpEndpoint
    serviceId: ServiceId
    service: HttpService
}): EndpointRequest | undefined {
    if (endpoint.sdkRequest == null) {
        return undefined
    }
    if (endpoint.sdkRequest.shape.type === 'wrapper') {
        if (context.shouldSkipWrappedRequest({ endpoint, wrapper: endpoint.sdkRequest.shape })) {
            return undefined
        }
    }
    return createEndpointRequest({
        context,
        endpoint,
        serviceId,
        service,
        sdkRequest: endpoint.sdkRequest
    })
}
