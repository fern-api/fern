import { assertNever } from '@fern-api/core-utils'
import { php } from '@fern-api/php-codegen'

import { HttpEndpoint, HttpService, PathParameter, SdkRequest, ServiceId } from '@fern-fern/ir-sdk/api'

import { SdkGeneratorContext } from '../SdkGeneratorContext'
import { EndpointSignatureInfo } from './EndpointSignatureInfo'
import { EndpointRequest } from './request/EndpointRequest'
import { getEndpointRequest } from './utils/getEndpointRequest'
import { getEndpointReturnType } from './utils/getEndpointReturnType'

export abstract class AbstractEndpointGenerator {
    protected readonly context: SdkGeneratorContext

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context
    }

    public getEndpointSignatureInfo({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: ServiceId
        service: HttpService
        endpoint: HttpEndpoint
    }): EndpointSignatureInfo {
        const { pathParameters, pathParameterReferences } = this.getAllPathParameters({ serviceId, endpoint })
        const request = getEndpointRequest({ context: this.context, endpoint, serviceId, service })
        const requestParameter = request != null ? this.getRequestParameter({ request }) : undefined
        return {
            baseParameters: [...pathParameters, requestParameter].filter((p): p is php.Parameter => p != null),
            pathParameters,
            pathParameterReferences,
            request,
            requestParameter,
            returnType: getEndpointReturnType({ context: this.context, endpoint })
        }
    }

    private getAllPathParameters({
        serviceId,
        endpoint
    }: {
        serviceId: ServiceId
        endpoint: HttpEndpoint
    }): Pick<EndpointSignatureInfo, 'pathParameters' | 'pathParameterReferences'> {
        const includePathParametersInSignature = this.includePathParametersInEndpointSignature({ endpoint })
        const pathParameters: php.Parameter[] = []
        const service = this.context.getHttpServiceOrThrow(serviceId)
        const pathParameterReferences: Record<string, string> = {}
        for (const pathParam of [
            ...this.context.ir.pathParameters,
            ...service.pathParameters,
            ...endpoint.pathParameters
        ]) {
            const parameterName = this.context.getParameterName(pathParam.name)
            pathParameterReferences[pathParam.name.originalName] = this.accessPathParameterValue({
                pathParameter: pathParam,
                sdkRequest: endpoint.sdkRequest,
                includePathParametersInEndpointSignature: includePathParametersInSignature
            })
            if (includePathParametersInSignature) {
                pathParameters.push(
                    php.parameter({
                        docs: pathParam.docs,
                        name: parameterName,
                        type: this.context.phpTypeMapper.convert({ reference: pathParam.valueType })
                    })
                )
            }
        }
        return {
            pathParameters,
            pathParameterReferences
        }
    }

    private getRequestParameter({ request }: { request: EndpointRequest }): php.Parameter {
        return php.parameter({
            type: request.getRequestParameterType(),
            name: request.getRequestParameterName(),
            initializer: request.shouldIncludeDefaultInitializer()
                ? php.codeblock((writer) => {
                      writer.write('new ')
                      writer.writeNode(request.getRequestParameterType())
                      writer.write('()')
                  })
                : undefined
        })
    }

    private includePathParametersInEndpointSignature({ endpoint }: { endpoint: HttpEndpoint }): boolean {
        const shape = endpoint.sdkRequest?.shape
        if (shape == null) {
            return true
        }
        switch (shape.type) {
            case 'wrapper': {
                return !this.context.includePathParametersInWrappedRequest({ endpoint, wrapper: shape })
            }
            case 'justRequestBody': {
                return true
            }
            default: {
                assertNever(shape)
            }
        }
    }

    private accessPathParameterValue({
        sdkRequest,
        pathParameter,
        includePathParametersInEndpointSignature
    }: {
        sdkRequest: SdkRequest | undefined
        pathParameter: PathParameter
        includePathParametersInEndpointSignature: boolean
    }): string {
        if (sdkRequest == null || includePathParametersInEndpointSignature) {
            return `$${this.context.getPropertyName(pathParameter.name)}`
        }
        return this.context.accessRequestProperty({
            requestParameterName: sdkRequest.requestParameterName,
            propertyName: pathParameter.name
        })
    }
}
