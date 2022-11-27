import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { Reference } from "../../Reference";

export interface ErrorReferencingContextMixin {
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
}
