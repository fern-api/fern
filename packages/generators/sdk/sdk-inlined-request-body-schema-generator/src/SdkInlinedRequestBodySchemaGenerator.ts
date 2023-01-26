import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { GeneratedSdkInlinedRequestBodySchema } from "@fern-typescript/contexts";
import { GeneratedSdkInlinedRequestBodySchemaImpl } from "./GeneratedSdkInlinedRequestBodySchemaImpl";

export declare namespace SdkInlinedRequestBodySchemaGenerator {
    export namespace generateInlinedRequestBodySchema {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
            typeName: string;
        }
    }
}

export class SdkInlinedRequestBodySchemaGenerator {
    public generateInlinedRequestBodySchema({
        service,
        endpoint,
        typeName,
    }: SdkInlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema.Args): GeneratedSdkInlinedRequestBodySchema {
        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Request is not inlined");
        }
        return new GeneratedSdkInlinedRequestBodySchemaImpl({
            service,
            endpoint,
            inlinedRequestBody: endpoint.requestBody,
            typeName,
        });
    }
}
