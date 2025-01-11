import express, { Request, Response } from "express";
import getPort from "get-port";
import { Server } from "http";
import { noop } from "lodash-es";
import urlJoin from "url-join";

import { isPlainObject } from "@fern-api/core-utils";
import { HttpEndpoint, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { NotEqual } from "./equal/EqualRequestResponse";
import { requestEqual } from "./equal/requestEqual";

type RequestHandler = (req: Request, res: Response) => void;

// TODO(FER-673): There are a few gaps in what the mock server can
// validate, which will require changes to the example IR.
export class MockServer {
    private app = express();
    private context: TaskContext;
    private server: Server | undefined = undefined;
    public port: number | undefined = undefined;

    constructor({
        context,
        ir,
        port
    }: {
        context: TaskContext;
        ir: IntermediateRepresentation;
        port: number | undefined;
    }) {
        this.context = context;
        this.app.use(express.json({ limit: "50mb", strict: false }));
        this.port = port;

        // Map of endpoint path to map of HTTP method to endpoints that fall into both
        const endpointGroups: Map<string, Map<string, HttpEndpoint[]>> = new Map<string, Map<string, HttpEndpoint[]>>();

        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                const endpointPath = getFullPathForEndpoint(endpoint);
                context.logger.debug(`Registering ${endpoint.method} ${endpointPath} ...`);

                const existingGroup = endpointGroups.get(endpointPath) ?? new Map();
                const existingEndpoints = existingGroup.get(endpoint.method) ?? [];

                endpointGroups.set(endpointPath, existingGroup.set(endpoint.method, [...existingEndpoints, endpoint]));
            }
        }

        // Sort the paths with a priority for literal path parts over parameters
        // e.g. /movie/:movieId should come after /movie/123, such that express
        // can match the exact endpoint before the variable one (/movie/:movieId)
        const sortExpressPaths = (
            endpoint1: [string, Map<string, HttpEndpoint[]>],
            endpoint2: [string, Map<string, HttpEndpoint[]>]
        ): number => {
            const path1 = endpoint1[0];
            const path2 = endpoint2[0];

            // Split the paths into components
            const components1 = path1.split("/");
            const components2 = path2.split("/");

            // If one path is a prefix of the other, the shorter one should come first
            if (components1.length !== components2.length) {
                return components1.length - components2.length;
            }

            for (let i = 0; i < Math.min(components1.length, components2.length); i++) {
                const comp1 = components1[i];
                const comp2 = components2[i];

                if (comp1 === comp2) {
                    continue; // If they are the same, move to the next component
                }

                if (comp1 == null || comp2 == null) {
                    return comp1 == null ? -1 : 1;
                }

                // Literal takes precedence over parameter
                const isComp1Param = comp1.startsWith(":");
                const isComp2Param = comp2.startsWith(":");

                if (isComp1Param && !isComp2Param) {
                    return 1;
                } else if (!isComp1Param && isComp2Param) {
                    return -1;
                } else {
                    // Lexicographical comparison if both are literals or both are parameters
                    return comp1.localeCompare(comp2);
                }
            }

            return 0;
        };

        const listGroups = Array.from(endpointGroups);
        const sortedEndpoints = listGroups.sort(sortExpressPaths);

        for (const [endpointPath, methodToEndpoints] of sortedEndpoints) {
            for (const [method, endpoints] of methodToEndpoints) {
                switch (method) {
                    case "GET":
                        this.app.get(endpointPath, getRequestHandler(endpoints));
                        break;
                    case "POST":
                        this.app.post(endpointPath, getRequestHandler(endpoints));
                        break;
                    case "PUT":
                        this.app.put(endpointPath, getRequestHandler(endpoints));
                        break;
                    case "PATCH":
                        this.app.patch(endpointPath, getRequestHandler(endpoints));
                        break;
                    case "DELETE":
                        this.app.delete(endpointPath, getRequestHandler(endpoints));
                        break;
                }
            }
        }
    }

    public stop(): void {
        this.server?.close();
    }

    public async start(): Promise<number> {
        this.port = this.port ?? (await getPort());
        this.server = this.app.listen(this.port);

        this.context.logger.info(`Running Fern mock server on localhost: ${this.port}`);
        return this.port;
    }

    public async keepAlive(): Promise<void> {
        // await infiinitely
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await new Promise(() => {});
    }
}

function getFullPathForEndpoint(endpoint: HttpEndpoint): string {
    let url = "";
    if (endpoint.fullPath.head.length > 0) {
        url = urlJoin(url, endpoint.fullPath.head);
    }
    for (const part of endpoint.fullPath.parts) {
        // Unlike the Fern IR, express expects the ':'
        // token to specify a path parameter.
        //
        //  /movie/:movieId
        //
        url = urlJoin(url, ":" + part.pathParameter);
        if (part.tail.length > 0) {
            url = urlJoin(url, part.tail);
        }
    }
    return url.startsWith("/") ? url : `/${url}`;
}

function getRequestHandler(endpoints: HttpEndpoint[]): RequestHandler {
    let hasExamples = false;
    return (req: Request, res: Response) => {
        const notEqualReasons: NotEqual[] = [];

        for (const endpoint of endpoints) {
            for (const example of [...endpoint.userSpecifiedExamples, ...endpoint.autogeneratedExamples]) {
                hasExamples = true;

                if (example.example != null) {
                    const match = requestEqual({ request: req, example: example.example });

                    if (match.type === "notEqual") {
                        notEqualReasons.push(match);
                        continue;
                    }

                    example.example.response?._visit({
                        ok: (ok) => {
                            ok._visit({
                                body: (body) => {
                                    if (body == null) {
                                        res.sendStatus(endpoint.response?.statusCode ?? 204);
                                        return;
                                    }

                                    if (endpoint.response?.body?.type === "text") {
                                        res.contentType("text/plain");
                                        res.send(body.jsonExample);
                                        return;
                                    }

                                    res.json(body.jsonExample);
                                },
                                stream: (stream) => {
                                    stream.forEach((chunk) => {
                                        res.write(chunk.jsonExample);
                                    });
                                    res.end();
                                },
                                sse: (sse) => {
                                    res.setHeader("Content-Type", "text/event-stream");
                                    sse.forEach((event) => {
                                        res.write(`event: ${event.event}\n`);
                                        res.write(`data: ${JSON.stringify(event.data.jsonExample)}\n\n`);
                                    });
                                    res.end();
                                },
                                _other: noop
                            });
                        },
                        error: (error) => {
                            res.status(endpoint.response?.statusCode ?? 500);
                            if (error.body == null) {
                                res.end();
                            } else {
                                res.json(error.body.jsonExample);
                            }
                        },
                        _other: noop
                    });
                    return;
                }
            }
        }
        if (!hasExamples) {
            res.status(500).send("This endpoint doesn't have any examples");
            return;
        }
        res.status(404).send({
            message: "Failed to match request with example",
            request: {
                url: req.url,
                headers: req.headers,
                body: req.body,
                pathParameters: req.params,
                queryParameters: req.query
            },
            notEqualReasons
        });
    };
}
