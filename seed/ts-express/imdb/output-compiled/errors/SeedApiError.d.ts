import type express from "express";
export declare abstract class SeedApiError extends Error {
    readonly errorName?: string | undefined;
    constructor(errorName?: string | undefined);
    abstract send(res: express.Response): Promise<void>;
}
