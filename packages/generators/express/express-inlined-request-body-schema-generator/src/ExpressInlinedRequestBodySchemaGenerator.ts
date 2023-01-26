import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { GeneratedExpressInlinedRequestBodySchema } from "@fern-typescript/contexts";
import { GeneratedExpressInlinedRequestBodySchemaImpl } from "./GeneratedExpressInlinedRequestBodySchemaImpl";

export declare namespace ExpressInlinedRequestBodySchemaGenerator {
    export namespace generateInlinedRequestBodySchema {
        export interface Args {
            service: HttpService;
            endpoint: HttpEndpoint;
            typeName: string;
        }
    }
}

export class ExpressInlinedRequestBodySchemaGenerator {
    public generateInlinedRequestBodySchema({
        service,
        endpoint,
        typeName,
    }: ExpressInlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema.Args): GeneratedExpressInlinedRequestBodySchema {
        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Request is not inlined");
        }
        return new GeneratedExpressInlinedRequestBodySchemaImpl({
            service,
            endpoint,
            inlinedRequestBody: endpoint.requestBody,
            typeName,
        });
    }
}
