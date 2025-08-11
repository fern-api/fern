import { Reference, Zurg } from "@fern-typescript/commons";

import { DeclaredErrorName } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkErrorSchema } from "./GeneratedSdkErrorSchema";

export interface SdkErrorSchemaContext {
    getGeneratedSdkErrorSchema: (errorName: DeclaredErrorName) => GeneratedSdkErrorSchema | undefined;
    getSchemaOfError: (errorName: DeclaredErrorName) => Zurg.Schema;
    getReferenceToSdkErrorSchema: (errorName: DeclaredErrorName) => Reference;
}
