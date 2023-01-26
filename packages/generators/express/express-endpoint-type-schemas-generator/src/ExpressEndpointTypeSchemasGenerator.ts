import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { GeneratedExpressEndpointTypeSchemas } from "@fern-typescript/contexts";
import { GeneratedExpressEndpointTypeSchemasImpl } from "./GeneratedExpressEndpointTypeSchemasImpl";

export declare namespace ExpressEndpointTypeSchemasGenerator {
    export namespace generateEndpointTypeSchemas {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class ExpressEndpointTypeSchemasGenerator {
    public generateEndpointTypeSchemas({
        service,
        endpoint,
    }: ExpressEndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedExpressEndpointTypeSchemas {
        return new GeneratedExpressEndpointTypeSchemasImpl({
            service,
            endpoint,
        });
    }
}
