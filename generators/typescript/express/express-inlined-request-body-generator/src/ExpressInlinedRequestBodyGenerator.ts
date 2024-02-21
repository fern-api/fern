import { InlinedRequestBody } from "@fern-fern/ir-sdk/api";
import { GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";
import { GeneratedExpressInlinedRequestBodyImpl } from "./GeneratedExpressInlinedRequestBodyImpl";

export declare namespace ExpressInlinedRequestBodyGenerator {
    export namespace generateInlinedRequestBody {
        export interface Args {
            requestBody: InlinedRequestBody;
            typeName: string;
        }
    }
}

export class ExpressInlinedRequestBodyGenerator {
    public generateInlinedRequestBody({
        requestBody,
        typeName
    }: ExpressInlinedRequestBodyGenerator.generateInlinedRequestBody.Args): GeneratedExpressInlinedRequestBody {
        return new GeneratedExpressInlinedRequestBodyImpl({
            requestBody,
            typeName
        });
    }
}
