import { PackageId } from "@fern-typescript/commons";
import { GeneratedExpressInlinedRequestBodySchema } from "@fern-typescript/contexts";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { GeneratedExpressInlinedRequestBodySchemaImpl } from "./GeneratedExpressInlinedRequestBodySchemaImpl";

export declare namespace ExpressInlinedRequestBodySchemaGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
        skipRequestValidation: boolean;
    }

    export namespace generateInlinedRequestBodySchema {
        export interface Args {
            packageId: PackageId;
            endpoint: HttpEndpoint;
            typeName: string;
        }
    }
}

export class ExpressInlinedRequestBodySchemaGenerator {
    private includeSerdeLayer: boolean;
    private skipRequestValidation: boolean;

    constructor({ includeSerdeLayer, skipRequestValidation }: ExpressInlinedRequestBodySchemaGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
        this.skipRequestValidation = skipRequestValidation;
    }

    public generateInlinedRequestBodySchema({
        packageId,
        endpoint,
        typeName
    }: ExpressInlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema.Args): GeneratedExpressInlinedRequestBodySchema {
        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Request is not inlined");
        }
        return new GeneratedExpressInlinedRequestBodySchemaImpl({
            packageId,
            endpoint,
            inlinedRequestBody: endpoint.requestBody,
            typeName,
            includeSerdeLayer: this.includeSerdeLayer,
            skipRequestValidation: this.skipRequestValidation
        });
    }
}
