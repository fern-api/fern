import {
    ExampleEndpointCall,
    ExamplePathParameter,
    ExampleTypeReference,
    HttpEndpoint,
    IntermediateRepresentation,
    NameAndWireValue
} from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import express, { Request, Response } from "express";
import getPort from "get-port";
import { IncomingHttpHeaders, Server } from "http";
import { isEqual, noop } from "lodash-es";
import urlJoin from "url-join";

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
        for (const endpoint of endpoints) {
            for (const example of [...endpoint.autogeneratedExamples, ...endpoint.userSpecifiedExamples]) {
                hasExamples = true;
                if (example.example != null && isRequestMatch(req, example.example)) {
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
        res.status(404).send(
            `Unrecognized example request: ${JSON.stringify(req.headers)} ${JSON.stringify(
                req.params
            )} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`
        );
    };
}

function isRequestMatch(req: Request, example: ExampleEndpointCall): boolean {
    return (
        validatePathParameters(example, req) &&
        validateQueryParameters(example, req) &&
        validateHeaders(example, req.headers) &&
        validateRequestBody(example, req)
    );
}

function validatePathParameters(example: ExampleEndpointCall, req: Request): boolean {
    const examplePathParameters = examplePathParametersToRecord([
        ...example.rootPathParameters,
        ...example.servicePathParameters,
        ...example.endpointPathParameters
    ]);
    if (Object.keys(examplePathParameters).length !== Object.keys(req.params).length) {
        return false;
    }
    if (Object.keys(examplePathParameters).length > 0) {
        if (!isEqual(req.params, examplePathParameters)) {
            return false;
        }
    }
    return true;
}

function validateQueryParameters(example: ExampleEndpointCall, req: Request): boolean {
    const exampleQueryParameters = examplesWithWireValueToRecord(example.queryParameters);
    if (Object.keys(exampleQueryParameters).length !== Object.keys(req.query).length) {
        return false;
    }

    const stringifiedQueryParams: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.query)) {
        if (value instanceof Date && value != null) {
            stringifiedQueryParams[key] = value.toISOString();
        } else {
            stringifiedQueryParams[key] = value;
        }
    }

    // TODO: confirm how deep-object query params works with this.
    return isEqual(req.query, stringifiedQueryParams);
}

function validateHeaders(example: ExampleEndpointCall, headers: IncomingHttpHeaders): boolean {
    // For headers, we're slightly more permissive. We allow more headers
    // than what are specified in the example (e.g. Accept, Content-Type, etc).
    const exampleHeaders = examplesWithWireValueToRecord([...example.serviceHeaders, ...example.endpointHeaders]);

    for (const [key, value] of Object.entries(exampleHeaders)) {
        const stringValue =
            typeof value === "string" ? value : typeof value === "boolean" ? `"${value}"` : JSON.stringify(value);
        if (headers[key.toLowerCase()] !== stringValue) {
            return false;
        }
    }
    return true;
}

function validateRequestBody(example: ExampleEndpointCall, req: Request): boolean {
    if (example.request == null) {
        // By default, express interprets an empty request body as '{}'.
        return isObject(req.body) && Object.keys(req.body).length === 0;
    }
    for (const [key, value] of Object.entries(req.body)) {
        if (value instanceof Date && value != null) {
            req.body[key] = value.toISOString();
        }
    }
    return isEqual(req.body, example.request.jsonExample);
}

// ExampleWithWireValue is implemented by both example headers and example query parameters.
interface ExampleWithWireValue {
    name: NameAndWireValue;
    value: ExampleTypeReference;
}

function examplesWithWireValueToRecord(examplesWithWireValue: ExampleWithWireValue[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    examplesWithWireValue.forEach((exampleWithWireValue) => {
        const value = exampleWithWireValue.value.jsonExample;
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        result[exampleWithWireValue.name.wireValue] = stringValue;
    });
    return result;
}

function examplePathParametersToRecord(examplePathParameters: ExamplePathParameter[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    examplePathParameters.forEach((examplePathParameter) => {
        const value = examplePathParameter.value.jsonExample;
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        result[examplePathParameter.name.originalName] = stringValue;
    });
    return result;
}

function isObject(value: unknown): value is object {
    return typeof value === "object" && value != null;
}
