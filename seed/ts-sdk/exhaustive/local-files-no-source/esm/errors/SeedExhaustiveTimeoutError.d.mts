import * as errors from "./index.mjs";
export declare class SeedExhaustiveTimeoutError extends errors.SeedExhaustiveError {
    constructor(message: string, opts?: {
        cause?: unknown;
    });
}
