import { PackageId } from "@fern-typescript/commons";
import { GeneratedExpressEndpointTypeSchemas } from "@fern-typescript/contexts";

import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

import { GeneratedExpressEndpointTypeSchemasImpl } from "./GeneratedExpressEndpointTypeSchemasImpl";

export declare namespace ExpressEndpointTypeSchemasGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
        skipRequestValidation: boolean;
        skipResponseValidation: boolean;
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
    private skipRequestValidation: boolean;
    private skipResponseValidation: boolean;

    constructor({
        includeSerdeLayer,
        allowExtraFields,
        skipRequestValidation,
        skipResponseValidation
    }: ExpressEndpointTypeSchemasGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
        this.skipRequestValidation = skipRequestValidation;
        this.skipResponseValidation = skipResponseValidation;
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
            allowExtraFields: this.allowExtraFields,
            skipRequestValidation: this.skipRequestValidation,
            skipResponseValidation: this.skipResponseValidation
        });
    }
}
