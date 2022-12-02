import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedError } from "../../generated-types";
import { Reference } from "../../Reference";

export interface ErrorContextMixin {
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
    getGeneratedError: (errorName: DeclaredErrorName) => GeneratedError | undefined;
    getErrorDeclaration: (errorName: DeclaredErrorName) => ErrorDeclaration;
}

export interface WithErrorContextMixin {
    error: ErrorContextMixin;
}
