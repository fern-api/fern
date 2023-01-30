import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressError } from "./GeneratedExpressError";

export interface ExpressErrorContextMixin {
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
    getErrorClassName: (errorName: DeclaredErrorName) => string;
    getGeneratedExpressError: (errorName: DeclaredErrorName) => GeneratedExpressError;
    getErrorDeclaration: (errorName: DeclaredErrorName) => ErrorDeclaration;
}

export interface WithExpressErrorContextMixin {
    expressError: ExpressErrorContextMixin;
}
