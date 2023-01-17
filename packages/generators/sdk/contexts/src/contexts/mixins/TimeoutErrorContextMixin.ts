import { GeneratedTimeoutError } from "../../generated-types";
import { Reference } from "../../Reference";

export interface TimeoutErrorContextMixin {
    getReferenceToTimeoutError: () => Reference;
    getGeneratedTimeoutError: () => GeneratedTimeoutError;
}

export interface WithTimeoutErrorContextMixin {
    timeoutError: TimeoutErrorContextMixin;
}
