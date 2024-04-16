import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedExpressEndpointTypeSchemas } from "@fern-typescript/contexts";
import { GeneratedExpressEndpointTypeSchemasImpl } from "./GeneratedExpressEndpointTypeSchemasImpl";

export declare namespace ExpressEndpointTypeSchemasGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
    }

    export namespace generateEndpointTypeSchemas {
        export interface Args {
            packageId: PackageId;
            service: HttpService;
            endpoint: HttpEndpoint;
        }
    }
}

export class ExpressEndpointTypeSchemasGenerator {
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;

    constructor({ includeSerdeLayer, allowExtraFields }: ExpressEndpointTypeSchemasGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
    }

    public generateEndpointTypeSchemas({
        packageId,
        service,
        endpoint
    }: ExpressEndpointTypeSchemasGenerator.generateEndpointTypeSchemas.Args): GeneratedExpressEndpointTypeSchemas {
        return new GeneratedExpressEndpointTypeSchemasImpl({
            packageId,
            service,
            endpoint,
            includeSerdeLayer: this.includeSerdeLayer,
            allowExtraFields: this.allowExtraFields
        });
    }
}
