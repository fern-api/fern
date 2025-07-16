import { go } from "@fern-api/go-ast"

import { HttpEndpoint, HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api"

import { SdkGeneratorContext } from "../SdkGeneratorContext"
import { AbstractEndpointGenerator } from "./AbstractEndpointGenerator"
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator"

export class EndpointGenerator extends AbstractEndpointGenerator {
    private http: HttpEndpointGenerator

    public constructor(context: SdkGeneratorContext) {
        super({ context })
        this.http = new HttpEndpointGenerator({ context })
    }

    public generate({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: ServiceId
        service: HttpService
        subpackage: Subpackage | undefined
        endpoint: HttpEndpoint
    }): go.Method[] {
        return this.http.generate({
            serviceId,
            service,
            subpackage,
            endpoint
        })
    }

    public generateRaw({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: ServiceId
        service: HttpService
        subpackage: Subpackage | undefined
        endpoint: HttpEndpoint
    }): go.Method[] {
        return this.http.generateRaw({
            serviceId,
            service,
            subpackage,
            endpoint
        })
    }
}
