import type * as core from "../core/index.mjs";
export declare class SeedExhaustiveError extends Error {
    readonly statusCode?: number;
    readonly body?: unknown;
    readonly rawResponse?: core.RawResponse;
    readonly cause?: unknown;
    constructor({ message, statusCode, body, rawResponse, cause, }: {
        message?: string;
        statusCode?: number;
        body?: unknown;
        rawResponse?: core.RawResponse;
        cause?: unknown;
    });
}
