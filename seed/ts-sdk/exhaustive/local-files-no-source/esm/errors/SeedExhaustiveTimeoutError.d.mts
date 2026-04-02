export declare class SeedExhaustiveTimeoutError extends Error {
    readonly cause?: unknown;
    constructor(message: string, opts?: {
        cause?: unknown;
    });
}
