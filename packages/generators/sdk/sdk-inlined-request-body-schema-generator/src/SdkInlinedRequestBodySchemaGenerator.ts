import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema } from "@fern-typescript/contexts";
import { GeneratedSdkInlinedRequestBodySchemaImpl } from "./GeneratedSdkInlinedRequestBodySchemaImpl";

export declare namespace SdkInlinedRequestBodySchemaGenerator {
    export namespace generateInlinedRequestBodySchema {
        export interface Args {
            packageId: PackageId;
            endpoint: HttpEndpoint;
            typeName: string;
        }
    }
}

export class SdkInlinedRequestBodySchemaGenerator {
    public generateInlinedRequestBodySchema({
        packageId,
        endpoint,
        typeName,
    }: SdkInlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema.Args): GeneratedSdkInlinedRequestBodySchema {
        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Request is not inlined");
        }
        return new GeneratedSdkInlinedRequestBodySchemaImpl({
            packageId,
            endpoint,
            inlinedRequestBody: endpoint.requestBody,
            typeName,
        });
    }
}
