/**
 * This file was auto-generated by Fern from our API Definition.
 */
import express from "express";
export interface V2ServiceMethods {
    test(req: express.Request<never, never, never, never>, res: {
        send: () => Promise<void>;
        cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
        locals: any;
    }): void | Promise<void>;
}
export declare class V2Service {
    private readonly methods;
    private router;
    constructor(methods: V2ServiceMethods, middleware?: express.RequestHandler[]);
    addMiddleware(handler: express.RequestHandler): this;
    toRouter(): express.Router;
}
