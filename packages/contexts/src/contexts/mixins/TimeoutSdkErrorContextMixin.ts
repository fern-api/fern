import { Reference } from "@fern-typescript/commons";
import { GeneratedTimeoutSdkError } from "../../generated-types";

export interface TimeoutSdkErrorContextMixin {
    getReferenceToTimeoutSdkError: () => Reference;
    getGeneratedTimeoutSdkError: () => GeneratedTimeoutSdkError;
}

export interface WithTimeoutSdkErrorContextMixin {
    timeoutSdkError: TimeoutSdkErrorContextMixin;
}
