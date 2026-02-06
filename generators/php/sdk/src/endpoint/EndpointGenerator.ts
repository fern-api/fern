import { php } from "@fern-api/php-codegen";

import { HttpEndpoint, HttpService, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { AbstractEndpointGenerator } from "./AbstractEndpointGenerator.js";
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator.js";

export class EndpointGenerator extends AbstractEndpointGenerator {
    private http: HttpEndpointGenerator;

    public constructor(context: SdkGeneratorContext) {
        super({ context });
        this.http = new HttpEndpointGenerator({ context });
    }

    public generate({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        endpoint: HttpEndpoint;
    }): php.Method[] {
        return this.http.generate({
            serviceId,
            service,
            endpoint
        });
    }
}
