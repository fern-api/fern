import { Reference } from "@fern-typescript/commons";

import { GeneratedTimeoutSdkError } from "./GeneratedTimeoutSdkError.js";

export interface TimeoutSdkErrorContext {
    getReferenceToTimeoutSdkError: () => Reference;
    getGeneratedTimeoutSdkError: () => GeneratedTimeoutSdkError;
}
