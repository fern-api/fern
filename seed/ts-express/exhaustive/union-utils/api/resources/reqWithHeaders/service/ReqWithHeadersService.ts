/**
 * This file was auto-generated by Fern from our API Definition.
 */

import express from "express";
import * as serializers from "../../../../serialization/index";
import * as errors from "../../../../errors/index";

export interface ReqWithHeadersServiceMethods {
    getWithCustomHeader(
        req: express.Request<never, never, string, never>,
        res: {
            send: () => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
}

export class ReqWithHeadersService {
    private router;

    constructor(
        private readonly methods: ReqWithHeadersServiceMethods,
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
        this.router.post("/custom-header", async (req, res, next) => {
            const request = serializers.reqWithHeaders.getWithCustomHeader.Request.parse(req.body);
            if (request.ok) {
                req.body = request.value;
                try {
                    await this.methods.getWithCustomHeader(
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
                    if (error instanceof errors.SeedExhaustiveError) {
                        console.warn(
                            `Endpoint 'getWithCustomHeader' unexpectedly threw ${error.constructor.name}.` +
                                ` If this was intentional, please add ${error.constructor.name} to` +
                                " the endpoint's errors list in your Fern Definition.",
                        );
                        await error.send(res);
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
