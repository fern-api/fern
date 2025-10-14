import type express from "express";
import * as errors from "../../../../errors/index";
import type * as SeedApi from "../../../index";
export declare class MovieDoesNotExistError extends errors.SeedApiError {
    private readonly body;
    constructor(body: SeedApi.MovieId);
    send(res: express.Response): Promise<void>;
}
