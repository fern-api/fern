import { Reference } from "@fern-typescript/commons";
import { GeneratedGenericAPISdkError } from "../../generated-types";

export interface GenericAPISdkErrorContextMixin {
    getReferenceToGenericAPISdkError: () => Reference;
    getGeneratedGenericAPISdkError: () => GeneratedGenericAPISdkError;
}

export interface WithGenericAPISdkErrorContextMixin {
    genericAPISdkError: GenericAPISdkErrorContextMixin;
}
