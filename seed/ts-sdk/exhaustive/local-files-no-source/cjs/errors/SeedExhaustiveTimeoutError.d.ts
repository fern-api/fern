import * as errors from "./index.js";
export declare class SeedExhaustiveTimeoutError extends errors.SeedExhaustiveError {
    constructor(message: string, opts?: {
        cause?: unknown;
    });
}
