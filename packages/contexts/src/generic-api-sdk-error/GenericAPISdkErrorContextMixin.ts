import { Reference } from "@fern-typescript/commons";
import { GeneratedGenericAPISdkError } from "./GeneratedGenericAPISdkError";

export interface GenericAPISdkErrorContextMixin {
    getReferenceToGenericAPISdkError: () => Reference;
    getGeneratedGenericAPISdkError: () => GeneratedGenericAPISdkError;
}

export interface WithGenericAPISdkErrorContextMixin {
    genericAPISdkError: GenericAPISdkErrorContextMixin;
}
