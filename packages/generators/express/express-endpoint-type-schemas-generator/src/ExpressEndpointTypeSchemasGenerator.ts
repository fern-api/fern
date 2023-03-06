import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedExpressEndpointTypeSchemas } from "@fern-typescript/contexts";
import { GeneratedExpressEndpointTypeSchemasImpl } from "./GeneratedExpressEndpointTypeSchemasImpl";

export declare namespace ExpressEndpointTypeSchemasGenerator {
    export namespace generateEndpointTypeSchemas {
        export interface Args {
            packageId: PackageId;
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class ExpressEndpointTypeSchemasGenerator {
    public generateEndpointTypeSchemas({
        packageId,
        service,
        endpoint,
    }: ExpressEndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedExpressEndpointTypeSchemas {
        return new GeneratedExpressEndpointTypeSchemasImpl({
            packageId,
            service,
            endpoint,
        });
    }
}
