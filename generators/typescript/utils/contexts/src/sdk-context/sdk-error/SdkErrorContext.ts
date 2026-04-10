import { FernIr } from "@fern-fern/ir-sdk";
import { Reference } from "@fern-typescript/commons";

import { GeneratedSdkError } from "./GeneratedSdkError.js";

export interface SdkErrorContext {
    getReferenceToError: (errorName: FernIr.DeclaredErrorName) => Reference;
    getGeneratedSdkError: (errorName: FernIr.DeclaredErrorName) => GeneratedSdkError | undefined;
    getErrorDeclaration: (errorName: FernIr.DeclaredErrorName) => FernIr.ErrorDeclaration;
}
