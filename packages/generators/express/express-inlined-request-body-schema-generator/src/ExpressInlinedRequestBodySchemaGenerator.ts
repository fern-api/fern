import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedExpressInlinedRequestBodySchema } from "@fern-typescript/contexts";
import { GeneratedExpressInlinedRequestBodySchemaImpl } from "./GeneratedExpressInlinedRequestBodySchemaImpl";

export declare namespace ExpressInlinedRequestBodySchemaGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
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

    constructor({ includeSerdeLayer }: ExpressInlinedRequestBodySchemaGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public generateInlinedRequestBodySchema({
        packageId,
        endpoint,
        typeName,
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
        });
    }
}
