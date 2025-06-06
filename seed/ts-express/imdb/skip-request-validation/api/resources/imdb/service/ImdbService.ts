/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedApi from "../../../index";
import express from "express";
import * as serializers from "../../../../serialization/index";
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
                movieId: serializers.MovieId.Raw;
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
            const request = serializers.CreateMovieRequest.parse(req.body, {
                unrecognizedObjectKeys: "passthrough",
                allowUnrecognizedUnionMembers: true,
                allowUnrecognizedEnumValues: true,
                skipValidation: true,
            });
            if (request.ok) {
                req.body = request.value;
                try {
                    await this.methods.createMovie(
                        req as any,
                        {
                            send: async (responseBody) => {
                                res.status(201).json(
                                    serializers.MovieId.jsonOrThrow(responseBody, { unrecognizedObjectKeys: "strip" }),
                                );
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
                            `Endpoint 'createMovie' unexpectedly threw ${error.constructor.name}.` +
                                ` If this was intentional, please add ${error.constructor.name} to` +
                                " the endpoint's errors list in your Fern Definition.",
                        );
                        await error.send(res);
                    } else {
                        res.status(500).json("Internal Server Error");
                    }
                    next(error);
                }
            } else {
                res.status(422).json({
                    errors: request.errors.map(
                        (error) => ["request", ...error.path].join(" -> ") + ": " + error.message,
                    ),
                });
                next(request.errors);
            }
        });
        this.router.get("/:movieId", async (req, res, next) => {
            try {
                await this.methods.getMovie(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.json(serializers.Movie.jsonOrThrow(responseBody, { unrecognizedObjectKeys: "strip" }));
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
                                `Endpoint 'getMovie' unexpectedly threw ${error.constructor.name}.` +
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
