/**
 * This file was auto-generated by Fern from our API Definition.
 */

import express from "express";
import * as SeedUnknownAsAny from "../../../index";
import * as serializers from "../../../../serialization/index";
import * as errors from "../../../../errors/index";

export interface UnknownServiceMethods {
    post(
        req: express.Request<never, unknown[], unknown, never>,
        res: {
            send: (responseBody: unknown[]) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    postObject(
        req: express.Request<never, unknown[], SeedUnknownAsAny.MyObject, never>,
        res: {
            send: (responseBody: unknown[]) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
}

export class UnknownService {
    private router;

    constructor(
        private readonly methods: UnknownServiceMethods,
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
        this.router.post("", async (req, res, next) => {
            try {
                await this.methods.post(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.json(
                                serializers.unknown.post.Response.jsonOrThrow(responseBody, {
                                    unrecognizedObjectKeys: "strip",
                                }),
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
                if (error instanceof errors.SeedUnknownAsAnyError) {
                    console.warn(
                        `Endpoint 'post' unexpectedly threw ${error.constructor.name}.` +
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
        this.router.post("/with-object", async (req, res, next) => {
            const request = serializers.MyObject.parse(req.body);
            if (request.ok) {
                req.body = request.value;
                try {
                    await this.methods.postObject(
                        req as any,
                        {
                            send: async (responseBody) => {
                                res.json(
                                    serializers.unknown.postObject.Response.jsonOrThrow(responseBody, {
                                        unrecognizedObjectKeys: "strip",
                                    }),
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
                    if (error instanceof errors.SeedUnknownAsAnyError) {
                        console.warn(
                            `Endpoint 'postObject' unexpectedly threw ${error.constructor.name}.` +
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
        return this.router;
    }
}
