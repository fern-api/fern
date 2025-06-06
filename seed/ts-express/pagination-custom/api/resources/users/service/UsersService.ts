/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedPagination from "../../../index";
import express from "express";
import * as serializers from "../../../../serialization/index";
import * as errors from "../../../../errors/index";

export interface UsersServiceMethods {
    listUsernamesCustom(
        req: express.Request<
            never,
            SeedPagination.UsernameCursor,
            never,
            {
                starting_after?: string;
            }
        >,
        res: {
            send: (responseBody: SeedPagination.UsernameCursor) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
}

export class UsersService {
    private router;

    constructor(
        private readonly methods: UsersServiceMethods,
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
        this.router.get("", async (req, res, next) => {
            try {
                await this.methods.listUsernamesCustom(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.json(
                                serializers.UsernameCursor.jsonOrThrow(responseBody, {
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
                if (error instanceof errors.SeedPaginationError) {
                    console.warn(
                        `Endpoint 'listUsernamesCustom' unexpectedly threw ${error.constructor.name}.` +
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
