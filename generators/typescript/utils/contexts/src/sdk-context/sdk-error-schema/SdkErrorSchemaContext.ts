import { FernIr } from "@fern-fern/ir-sdk";
import { Reference, Zurg } from "@fern-typescript/commons";

import { GeneratedSdkErrorSchema } from "./GeneratedSdkErrorSchema.js";

export interface SdkErrorSchemaContext {
    getGeneratedSdkErrorSchema: (errorName: FernIr.DeclaredErrorName) => GeneratedSdkErrorSchema | undefined;
    getSchemaOfError: (errorName: FernIr.DeclaredErrorName) => Zurg.Schema;
    getReferenceToSdkErrorSchema: (errorName: FernIr.DeclaredErrorName) => Reference;
}
