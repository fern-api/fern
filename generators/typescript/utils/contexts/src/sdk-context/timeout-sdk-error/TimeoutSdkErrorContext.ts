import { Reference } from "@fern-typescript/commons";

import { GeneratedTimeoutSdkError } from "./GeneratedTimeoutSdkError";

export interface TimeoutSdkErrorContext {
    getReferenceToTimeoutSdkError: () => Reference;
    getGeneratedTimeoutSdkError: () => GeneratedTimeoutSdkError;
}
