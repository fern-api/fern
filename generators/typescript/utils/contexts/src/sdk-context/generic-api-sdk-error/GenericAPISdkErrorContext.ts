import { Reference } from "@fern-typescript/commons";

import { GeneratedGenericAPISdkError } from "./GeneratedGenericAPISdkError";

export interface GenericAPISdkErrorContext {
    getReferenceToGenericAPISdkError: () => Reference;
    getGeneratedGenericAPISdkError: () => GeneratedGenericAPISdkError;
}
