import { FernIr } from "@fern-fern/ir-sdk";
import { Reference } from "@fern-typescript/commons";

import { GeneratedExpressError } from "./GeneratedExpressError.js";

export interface ExpressErrorContext {
    getReferenceToError: (errorName: FernIr.DeclaredErrorName) => Reference;
    getErrorClassName: (errorName: FernIr.DeclaredErrorName) => string;
    getGeneratedExpressError: (errorName: FernIr.DeclaredErrorName) => GeneratedExpressError;
    getErrorDeclaration: (errorName: FernIr.DeclaredErrorName) => FernIr.ErrorDeclaration;
}
