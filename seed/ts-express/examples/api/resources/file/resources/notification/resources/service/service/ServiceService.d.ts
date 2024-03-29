/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as SeedExamples from "../../../../../../..";
import express from "express";
export interface ServiceServiceMethods {
    getException(req: express.Request<{
        notificationId: string;
    }, SeedExamples.Exception, never, never>, res: {
        send: (responseBody: SeedExamples.Exception) => Promise<void>;
        cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
        locals: any;
    }): void | Promise<void>;
}
export declare class ServiceService {
    private readonly methods;
    private router;
    constructor(methods: ServiceServiceMethods, middleware?: express.RequestHandler[]);
    addMiddleware(handler: express.RequestHandler): this;
    toRouter(): express.Router;
}
