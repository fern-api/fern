import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

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
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
    }): php.Method[] {
        return this.http.generate({
            serviceId,
            service,
            endpoint
        });
    }
}
