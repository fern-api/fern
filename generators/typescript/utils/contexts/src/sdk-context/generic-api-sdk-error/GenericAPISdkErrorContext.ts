import { Reference } from "@fern-typescript/commons";

import { GeneratedGenericAPISdkError } from "./GeneratedGenericAPISdkError.js";

export interface GenericAPISdkErrorContext {
    getReferenceToGenericAPISdkError: () => Reference;
    getGeneratedGenericAPISdkError: () => GeneratedGenericAPISdkError;
}
