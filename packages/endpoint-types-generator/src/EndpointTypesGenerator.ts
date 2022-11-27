import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { GeneratedEndpointTypes } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedEndpointTypesImpl } from "./GeneratedEndpointTypesImpl";

export declare namespace EndpointTypesGenerator {
    export namespace generateEndpointTypes {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class EndpointTypesGenerator {
    public generateEndpointTypes({
        service,
        endpoint,
    }: EndpointTypesGenerator.generateEndpointTypes.Args): GeneratedEndpointTypes {
        return new GeneratedEndpointTypesImpl({ service, endpoint });
    }
}
