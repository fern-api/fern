import { DeclaredErrorName, ErrorDeclaration } from "@fern-api/ir-sdk";
import { Reference } from "@fern-typescript/commons";

import { GeneratedExpressError } from "./GeneratedExpressError";

export interface ExpressErrorContext {
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
    getErrorClassName: (errorName: DeclaredErrorName) => string;
    getGeneratedExpressError: (errorName: DeclaredErrorName) => GeneratedExpressError;
    getErrorDeclaration: (errorName: DeclaredErrorName) => ErrorDeclaration;
}
