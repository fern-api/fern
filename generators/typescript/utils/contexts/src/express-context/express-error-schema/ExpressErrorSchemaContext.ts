import { FernIr } from "@fern-fern/ir-sdk";
import { Reference, Zurg } from "@fern-typescript/commons";

import { GeneratedExpressErrorSchema } from "./GeneratedExpressErrorSchema.js";

export interface ExpressErrorSchemaContext {
    getGeneratedExpressErrorSchema: (errorName: FernIr.DeclaredErrorName) => GeneratedExpressErrorSchema | undefined;
    getSchemaOfError: (errorName: FernIr.DeclaredErrorName) => Zurg.Schema;
    getReferenceToExpressErrorSchema: (errorName: FernIr.DeclaredErrorName) => Reference;
}
