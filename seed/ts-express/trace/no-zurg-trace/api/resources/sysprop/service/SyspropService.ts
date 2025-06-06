/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedTrace from "../../../index";
import express from "express";
import * as errors from "../../../../errors/index";

export interface SyspropServiceMethods {
    setNumWarmInstances(
        req: express.Request<
            {
                language: SeedTrace.Language;
                numWarmInstances: number;
            },
            never,
            never,
            never
        >,
        res: {
            send: () => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    getNumWarmInstances(
        req: express.Request<never, Record<SeedTrace.Language, number | undefined>, never, never>,
        res: {
            send: (responseBody: Record<SeedTrace.Language, number | undefined>) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
}

export class SyspropService {
    private router;

    constructor(
        private readonly methods: SyspropServiceMethods,
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
        this.router.put("/num-warm-instances/:language/:numWarmInstances", async (req, res, next) => {
            try {
                await this.methods.setNumWarmInstances(
                    req as any,
                    {
                        send: async () => {
                            res.sendStatus(204);
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
                if (error instanceof errors.SeedTraceError) {
                    console.warn(
                        `Endpoint 'setNumWarmInstances' unexpectedly threw ${error.constructor.name}.` +
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
        this.router.get("/num-warm-instances", async (req, res, next) => {
            try {
                await this.methods.getNumWarmInstances(
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
                if (error instanceof errors.SeedTraceError) {
                    console.warn(
                        `Endpoint 'getNumWarmInstances' unexpectedly threw ${error.constructor.name}.` +
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
        return this.router;
    }
}
