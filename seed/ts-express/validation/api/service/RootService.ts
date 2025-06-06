/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedValidation from "../index";
import express from "express";
import * as serializers from "../../serialization/index";
import * as errors from "../../errors/index";

export interface RootServiceMethods {
    create(
        req: express.Request<never, SeedValidation.Type, SeedValidation.CreateRequest, never>,
        res: {
            send: (responseBody: SeedValidation.Type) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    get(
        req: express.Request<
            never,
            SeedValidation.Type,
            never,
            {
                decimal: number;
                even: number;
                name: string;
            }
        >,
        res: {
            send: (responseBody: SeedValidation.Type) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
}

export class RootService {
    private router;

    constructor(
        private readonly methods: RootServiceMethods,
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
        this.router.post("/create", async (req, res, next) => {
            const request = serializers.CreateRequest.parse(req.body);
            if (request.ok) {
                req.body = request.value;
                try {
                    await this.methods.create(
                        req as any,
                        {
                            send: async (responseBody) => {
                                res.json(
                                    serializers.Type.jsonOrThrow(responseBody, { unrecognizedObjectKeys: "strip" }),
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
                    if (error instanceof errors.SeedValidationError) {
                        console.warn(
                            `Endpoint 'create' unexpectedly threw ${error.constructor.name}.` +
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
        this.router.get("", async (req, res, next) => {
            try {
                await this.methods.get(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.json(serializers.Type.jsonOrThrow(responseBody, { unrecognizedObjectKeys: "strip" }));
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
                if (error instanceof errors.SeedValidationError) {
                    console.warn(
                        `Endpoint 'get' unexpectedly threw ${error.constructor.name}.` +
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
