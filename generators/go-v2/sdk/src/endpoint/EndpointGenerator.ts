import { go } from "@fern-api/go-ast";
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
        subpackage,
        endpoint
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        subpackage: FernIr.Subpackage | undefined;
        endpoint: FernIr.HttpEndpoint;
    }): go.Method | undefined {
        return this.http.generate({
            serviceId,
            service,
            subpackage,
            endpoint
        });
    }

    public generateRaw({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        subpackage: FernIr.Subpackage | undefined;
        endpoint: FernIr.HttpEndpoint;
    }): go.Method | undefined {
        return this.http.generateRaw({
            serviceId,
            service,
            subpackage,
            endpoint
        });
    }
}
