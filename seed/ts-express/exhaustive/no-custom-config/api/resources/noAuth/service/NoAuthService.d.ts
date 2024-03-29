/**
 * This file was auto-generated by Fern from our API Definition.
 */
import express from "express";
export interface NoAuthServiceMethods {
    postWithNoAuth(req: express.Request<never, boolean, unknown, never>, res: {
        send: (responseBody: boolean) => Promise<void>;
        cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
        locals: any;
    }): void | Promise<void>;
}
export declare class NoAuthService {
    private readonly methods;
    private router;
    constructor(methods: NoAuthServiceMethods, middleware?: express.RequestHandler[]);
    addMiddleware(handler: express.RequestHandler): this;
    toRouter(): express.Router;
}
