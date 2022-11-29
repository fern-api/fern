import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { Zurg } from "@fern-typescript/commons-v2";
import { Reference } from "../../Reference";

export interface ErrorSchemaReferencingContextMixin {
    getReferenceToRawError: (errorName: DeclaredErrorName) => Reference;
    getSchemaOfError: (errorName: DeclaredErrorName) => Zurg.Schema;
}
