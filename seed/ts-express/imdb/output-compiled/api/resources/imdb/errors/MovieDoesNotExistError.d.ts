import * as errors from "../../../../errors/index";
import * as SeedApi from "../../../index";
import express from "express";
export declare class MovieDoesNotExistError extends errors.SeedApiError {
    private readonly body;
    constructor(body: SeedApi.MovieId);
    send(res: express.Response): Promise<void>;
}
