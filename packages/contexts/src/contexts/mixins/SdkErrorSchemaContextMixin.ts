import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { Reference, Zurg } from "@fern-typescript/commons";
import { GeneratedSdkErrorSchema } from "../../generated-types";

export interface SdkErrorSchemaContextMixin {
    getGeneratedSdkErrorSchema: (errorName: DeclaredErrorName) => GeneratedSdkErrorSchema | undefined;
    getSchemaOfError: (errorName: DeclaredErrorName) => Zurg.Schema;
    getReferenceToSdkErrorSchema: (errorName: DeclaredErrorName) => Reference;
}

export interface WithSdkErrorSchemaContextMixin {
    sdkErrorSchema: SdkErrorSchemaContextMixin;
}
