import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";

import { GeneratedExpressInlinedRequestBodyImpl } from "./GeneratedExpressInlinedRequestBodyImpl.js";

export declare namespace ExpressInlinedRequestBodyGenerator {
    export namespace generateInlinedRequestBody {
        export interface Args {
            requestBody: FernIr.InlinedRequestBody;
            typeName: string;
            retainOriginalCasing: boolean;
            includeSerdeLayer: boolean;
        }
    }
}

export class ExpressInlinedRequestBodyGenerator {
    public generateInlinedRequestBody({
        requestBody,
        typeName,
        retainOriginalCasing,
        includeSerdeLayer
    }: ExpressInlinedRequestBodyGenerator.generateInlinedRequestBody.Args): GeneratedExpressInlinedRequestBody {
        return new GeneratedExpressInlinedRequestBodyImpl({
            requestBody,
            typeName,
            retainOriginalCasing,
            includeSerdeLayer
        });
    }
}
