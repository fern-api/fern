/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedApi from "../../../index";
import express from "express";
import * as errors from "../../../../errors/index";

export interface ImdbServiceMethods {
    createMovie(
        req: express.Request<never, SeedApi.MovieId, SeedApi.CreateMovieRequest, never>,
        res: {
            send: (responseBody: SeedApi.MovieId) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    getMovie(
        req: express.Request<
            {
                movie_id: SeedApi.MovieId;
            },
            SeedApi.Movie,
            never,
            never
        >,
        res: {
            send: (responseBody: SeedApi.Movie) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
}

export class ImdbService {
    private router;

    constructor(
        private readonly methods: ImdbServiceMethods,
        middleware: express.RequestHandler[] = [],
    ) {
        this.router = express.Router({ mergeParams: true }).use(
            express.json({
                strict: false,
            }),
            ...middleware,
        );
    }

    public addMiddleware(handler: express.RequestHandler): this {
        this.router.use(handler);
        return this;
    }

    public toRouter(): express.Router {
        this.router.post("/create-movie", async (req, res, next) => {
            try {
                await this.methods.createMovie(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.status(201).json(responseBody);
                        },
                        cookie: res.cookie.bind(res),
                        locals: res.locals,
                    },
                    next,
                );
                if (!res.writableEnded) {
                    next();
                }
            } catch (error) {
                if (error instanceof errors.SeedApiError) {
                    console.warn(
                        `Endpoint 'create_movie' unexpectedly threw ${error.constructor.name}.` +
                            ` If this was intentional, please add ${error.constructor.name} to` +
                            " the endpoint's errors list in your Fern Definition.",
                    );
                    await error.send(res);
                } else {
                    res.status(500).json("Internal Server Error");
                }
                next(error);
            }
        });
        this.router.get("/:movie_id", async (req, res, next) => {
            try {
                await this.methods.getMovie(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.json(responseBody);
                        },
                        cookie: res.cookie.bind(res),
                        locals: res.locals,
                    },
                    next,
                );
                if (!res.writableEnded) {
                    next();
                }
            } catch (error) {
                if (error instanceof errors.SeedApiError) {
                    switch (error.errorName) {
                        case "MovieDoesNotExistError":
                            break;
                        default:
                            console.warn(
                                `Endpoint 'get_movie' unexpectedly threw ${error.constructor.name}.` +
                                    ` If this was intentional, please add ${error.constructor.name} to` +
                                    " the endpoint's errors list in your Fern Definition.",
                            );
                    }
                    await error.send(res);
                } else {
                    res.status(500).json("Internal Server Error");
                }
                next(error);
            }
        });
        return this.router;
    }
}
