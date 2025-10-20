import express from "express";
import * as serializers from "../../../../serialization/index";
import type * as SeedApi from "../../../index";
export interface ImdbServiceMethods {
    createMovie(req: express.Request<never, SeedApi.MovieId, SeedApi.CreateMovieRequest, never>, res: {
        send: (responseBody: SeedApi.MovieId) => Promise<void>;
        cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
        locals: any;
    }, next: express.NextFunction): void | Promise<void>;
    getMovie(req: express.Request<{
        movieId: serializers.MovieId.Raw;
    }, SeedApi.Movie, never, never>, res: {
        send: (responseBody: SeedApi.Movie) => Promise<void>;
        cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
        locals: any;
    }, next: express.NextFunction): void | Promise<void>;
}
export declare class ImdbService {
    private readonly methods;
    private router;
    constructor(methods: ImdbServiceMethods, middleware?: express.RequestHandler[]);
    addMiddleware(handler: express.RequestHandler): this;
    toRouter(): express.Router;
}
