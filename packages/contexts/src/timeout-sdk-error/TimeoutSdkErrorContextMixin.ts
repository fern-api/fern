import { Reference } from "@fern-typescript/commons";
import { GeneratedTimeoutSdkError } from "./GeneratedTimeoutSdkError";

export interface TimeoutSdkErrorContextMixin {
    getReferenceToTimeoutSdkError: () => Reference;
    getGeneratedTimeoutSdkError: () => GeneratedTimeoutSdkError;
}

export interface WithTimeoutSdkErrorContextMixin {
    timeoutSdkError: TimeoutSdkErrorContextMixin;
}
