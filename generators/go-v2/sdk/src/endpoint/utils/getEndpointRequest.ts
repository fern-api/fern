import { assertNever } from "@fern-api/core-utils"

import { HttpEndpoint, HttpService, SdkRequest, ServiceId } from "@fern-fern/ir-sdk/api"

import { SdkGeneratorContext } from "../../SdkGeneratorContext"
import { EndpointSignatureInfo } from "../EndpointSignatureInfo"
import { BytesRequest } from "../request/BytesRequest"
import { EndpointRequest } from "../request/EndpointRequest"
import { ReferencedEndpointRequest } from "../request/ReferencedEndpointRequest"
import { WrappedEndpointRequest } from "../request/WrappedEndpointRequest"

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
    return createEndpointRequest({
        context,
        endpoint,
        serviceId,
        service,
        sdkRequest: endpoint.sdkRequest
    })
}

function createEndpointRequest({
    context,
    sdkRequest,
    endpoint,
    service,
    serviceId
}: {
    context: SdkGeneratorContext
    sdkRequest: SdkRequest
    endpoint: HttpEndpoint
    service: HttpService
    serviceId: ServiceId
}): EndpointRequest | undefined {
    switch (sdkRequest.shape.type) {
        case "wrapper":
            return new WrappedEndpointRequest({
                context,
                serviceId,
                sdkRequest,
                wrapper: sdkRequest.shape,
                service,
                endpoint
            })
        case "justRequestBody":
            if (sdkRequest.shape.value.type === "bytes") {
                return new BytesRequest(context, sdkRequest, service, endpoint)
            }
            return new ReferencedEndpointRequest(
                context,
                sdkRequest,
                service,
                endpoint,
                sdkRequest.shape.value.requestBodyType
            )
        default:
            assertNever(sdkRequest.shape)
    }
}
