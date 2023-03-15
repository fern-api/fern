import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { Reference, Zurg } from "@fern-typescript/commons";
import { GeneratedExpressErrorSchema } from "./GeneratedExpressErrorSchema";

export interface ExpressErrorSchemaContextMixin {
    getGeneratedExpressErrorSchema: (errorName: DeclaredErrorName) => GeneratedExpressErrorSchema | undefined;
    getSchemaOfError: (errorName: DeclaredErrorName) => Zurg.Schema;
    getReferenceToExpressErrorSchema: (errorName: DeclaredErrorName) => Reference;
}

export interface WithExpressErrorSchemaContextMixin {
    expressErrorSchema: ExpressErrorSchemaContextMixin;
}
