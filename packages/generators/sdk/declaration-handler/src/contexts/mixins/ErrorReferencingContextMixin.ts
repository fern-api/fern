import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { GeneratedError } from "../../generated-types";
import { Reference } from "../../Reference";

export interface ErrorReferencingContextMixin {
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
    getGeneratedError: (errorName: DeclaredErrorName) => GeneratedError | undefined;
}
