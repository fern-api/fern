import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { Zurg } from "@fern-typescript/commons-v2";
import { GeneratedErrorSchema } from "../../generated-types";
import { Reference } from "../../Reference";

export interface ErrorSchemaContextMixin {
    getGeneratedErrorSchema: (errorName: DeclaredErrorName) => GeneratedErrorSchema | undefined;
    getReferenceToRawError: (errorName: DeclaredErrorName) => Reference;
    getSchemaOfError: (errorName: DeclaredErrorName) => Zurg.Schema;
}

export interface WithErrorSchemaContextMixin {
    errorSchema: ErrorSchemaContextMixin;
}
