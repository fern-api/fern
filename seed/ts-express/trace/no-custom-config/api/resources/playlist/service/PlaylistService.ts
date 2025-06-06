/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedTrace from "../../../index";
import express from "express";
import * as serializers from "../../../../serialization/index";
import * as errors from "../../../../errors/index";

export interface PlaylistServiceMethods {
    createPlaylist(
        req: express.Request<
            {
                serviceParam: number;
            },
            SeedTrace.Playlist,
            SeedTrace.PlaylistCreateRequest,
            {
                datetime: Date;
                optionalDatetime?: Date;
            }
        >,
        res: {
            send: (responseBody: SeedTrace.Playlist) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    getPlaylists(
        req: express.Request<
            {
                serviceParam: number;
            },
            SeedTrace.Playlist[],
            never,
            {
                limit?: number;
                otherField: string;
                multiLineDocs: string;
                optionalMultipleField?: string;
                multipleField: string;
            }
        >,
        res: {
            send: (responseBody: SeedTrace.Playlist[]) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    getPlaylist(
        req: express.Request<
            {
                serviceParam: number;
                playlistId: serializers.PlaylistId.Raw;
            },
            SeedTrace.Playlist,
            never,
            never
        >,
        res: {
            send: (responseBody: SeedTrace.Playlist) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    updatePlaylist(
        req: express.Request<
            {
                serviceParam: number;
                playlistId: serializers.PlaylistId.Raw;
            },
            SeedTrace.Playlist | undefined,
            SeedTrace.UpdatePlaylistRequest | undefined,
            never
        >,
        res: {
            send: (responseBody: SeedTrace.Playlist | undefined) => Promise<void>;
            cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
            locals: any;
        },
        next: express.NextFunction,
    ): void | Promise<void>;
    deletePlaylist(
        req: express.Request<
            {
                serviceParam: number;
                playlist_id: serializers.PlaylistId.Raw;
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
}

export class PlaylistService {
    private router;

    constructor(
        private readonly methods: PlaylistServiceMethods,
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
            const request = serializers.PlaylistCreateRequest.parse(req.body);
            if (request.ok) {
                req.body = request.value;
                try {
                    await this.methods.createPlaylist(
                        req as any,
                        {
                            send: async (responseBody) => {
                                res.json(
                                    serializers.Playlist.jsonOrThrow(responseBody, { unrecognizedObjectKeys: "strip" }),
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
                    if (error instanceof errors.SeedTraceError) {
                        console.warn(
                            `Endpoint 'createPlaylist' unexpectedly threw ${error.constructor.name}.` +
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
        this.router.get("/all", async (req, res, next) => {
            try {
                await this.methods.getPlaylists(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.json(
                                serializers.playlist.getPlaylists.Response.jsonOrThrow(responseBody, {
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
                if (error instanceof errors.SeedTraceError) {
                    console.warn(
                        `Endpoint 'getPlaylists' unexpectedly threw ${error.constructor.name}.` +
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
        this.router.get("/:playlistId", async (req, res, next) => {
            try {
                await this.methods.getPlaylist(
                    req as any,
                    {
                        send: async (responseBody) => {
                            res.json(
                                serializers.Playlist.jsonOrThrow(responseBody, { unrecognizedObjectKeys: "strip" }),
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
                if (error instanceof errors.SeedTraceError) {
                    switch (error.errorName) {
                        case "PlaylistIdNotFoundError":
                        case "UnauthorizedError":
                            break;
                        default:
                            console.warn(
                                `Endpoint 'getPlaylist' unexpectedly threw ${error.constructor.name}.` +
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
        this.router.put("/:playlistId", async (req, res, next) => {
            const request = serializers.playlist.updatePlaylist.Request.parse(req.body);
            if (request.ok) {
                req.body = request.value;
                try {
                    await this.methods.updatePlaylist(
                        req as any,
                        {
                            send: async (responseBody) => {
                                res.json(
                                    serializers.playlist.updatePlaylist.Response.jsonOrThrow(responseBody, {
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
                    if (error instanceof errors.SeedTraceError) {
                        switch (error.errorName) {
                            case "PlaylistIdNotFoundError":
                                break;
                            default:
                                console.warn(
                                    `Endpoint 'updatePlaylist' unexpectedly threw ${error.constructor.name}.` +
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
            } else {
                res.status(422).json({
                    errors: request.errors.map(
                        (error) => ["request", ...error.path].join(" -> ") + ": " + error.message,
                    ),
                });
                next(request.errors);
            }
        });
        this.router.delete("/:playlist_id", async (req, res, next) => {
            try {
                await this.methods.deletePlaylist(
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
                        `Endpoint 'deletePlaylist' unexpectedly threw ${error.constructor.name}.` +
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
