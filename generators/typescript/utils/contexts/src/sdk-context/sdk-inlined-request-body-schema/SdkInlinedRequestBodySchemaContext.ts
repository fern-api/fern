import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedSdkInlinedRequestBodySchema } from "./GeneratedSdkInlinedRequestBodySchema.js";

export interface SdkInlinedRequestBodySchemaContext {
    getGeneratedInlinedRequestBodySchema: (
        packageId: PackageId,
        endpointName: FernIr.Name
    ) => GeneratedSdkInlinedRequestBodySchema;
    getReferenceToInlinedRequestBody: (packageId: PackageId, endpointName: FernIr.Name) => Reference;
}
