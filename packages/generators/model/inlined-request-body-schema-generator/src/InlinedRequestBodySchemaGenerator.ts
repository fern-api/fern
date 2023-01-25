import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { GeneratedInlinedRequestBodySchema } from "@fern-typescript/contexts";
import { GeneratedInlinedRequestBodySchemaImpl } from "./GeneratedInlinedRequestBodySchemaImpl";

export declare namespace InlinedRequestBodySchemaGenerator {
    export namespace generateInlinedRequestBodySchema {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
            typeName: string;
        }
    }
}

export class InlinedRequestBodySchemaGenerator {
    public generateInlinedRequestBodySchema({
        service,
        endpoint,
        typeName,
    }: InlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema.Args): GeneratedInlinedRequestBodySchema {
        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Request is not inlined");
        }
        return new GeneratedInlinedRequestBodySchemaImpl({
            service,
            endpoint,
            inlinedRequestBody: endpoint.requestBody,
            typeName,
        });
    }
}
