import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedExpressInlinedRequestBody } from "./GeneratedExpressInlinedRequestBody.js";

export interface ExpressInlinedRequestBodyContext {
    getGeneratedInlinedRequestBody: (
        packageId: PackageId,
        endpointName: FernIr.NameOrString
    ) => GeneratedExpressInlinedRequestBody;
    getReferenceToInlinedRequestBodyType: (packageId: PackageId, endpointName: FernIr.NameOrString) => Reference;
}
