import { go } from '@fern-api/go-ast'

import { HttpEndpoint, HttpService, SdkRequest, TypeReference } from '@fern-fern/ir-sdk/api'

import { SdkGeneratorContext } from '../../SdkGeneratorContext'
import { EndpointRequest } from './EndpointRequest'

export class ReferencedEndpointRequest extends EndpointRequest {
    private requestBodyShape: TypeReference

    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: SdkRequest,
        service: HttpService,
        endpoint: HttpEndpoint,
        requestBodyShape: TypeReference
    ) {
        super(context, sdkRequest, service, endpoint)
        this.requestBodyShape = requestBodyShape
    }

    public getRequestParameterType(): go.Type {
        return this.context.goTypeMapper.convert({ reference: this.requestBodyShape })
    }

    public getRequestBodyBlock(): go.AstNode | undefined {
        return undefined
    }
}
