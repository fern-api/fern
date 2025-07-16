import { Reference, Zurg } from "@fern-typescript/commons";

import { DeclaredErrorName } from "@fern-fern/ir-sdk/api";

import { GeneratedExpressErrorSchema } from "./GeneratedExpressErrorSchema";

export interface ExpressErrorSchemaContext {
    getGeneratedExpressErrorSchema: (errorName: DeclaredErrorName) => GeneratedExpressErrorSchema | undefined;
    getSchemaOfError: (errorName: DeclaredErrorName) => Zurg.Schema;
    getReferenceToExpressErrorSchema: (errorName: DeclaredErrorName) => Reference;
}
