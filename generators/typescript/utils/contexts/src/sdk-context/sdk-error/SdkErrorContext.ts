import { Reference } from "@fern-typescript/commons";

import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-sdk";

import { GeneratedSdkError } from "./GeneratedSdkError";

export interface SdkErrorContext {
    getReferenceToError: (errorName: DeclaredErrorName) => Reference;
    getGeneratedSdkError: (errorName: DeclaredErrorName) => GeneratedSdkError | undefined;
    getErrorDeclaration: (errorName: DeclaredErrorName) => ErrorDeclaration;
}
