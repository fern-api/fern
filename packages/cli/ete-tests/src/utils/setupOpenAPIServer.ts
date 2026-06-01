import express from "express";
import * as http from "http";
import { OpenAPI } from "openapi-types";

const TEST_OPENAPI_DOCUMENT: OpenAPI.Document = {
    openapi: "3.0.0",
    info: {
        title: "Test API",
        version: "1.0.0"
    },
    paths: {
        "/testdata": {
            get: {
                summary: "Retrieve test data",
                operationId: "getTestData",
                responses: {
                    "200": {
                        description: "Successful response",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/filtered": {
            get: {
                summary: "This endpoint should be filtered out",
                operationId: "filtered",
                responses: {
                    "200": {
                        description: "Successful response",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export interface OpenAPIServerHandle {
    server: http.Server;
    port: number;
    url: string;
    cleanup: () => Promise<void>;
}

export async function setupOpenAPIServer(options: { port?: number } = {}): Promise<OpenAPIServerHandle> {
    const app = express();

    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    app.get("/openapi.json", (req: any, res: any) => {
        res.json(TEST_OPENAPI_DOCUMENT);
    });

    const requestedPort = options.port ?? 0;
    const server = await new Promise<http.Server>((resolve, reject) => {
        const s = app.listen(requestedPort);
        s.once("listening", () => resolve(s));
        s.once("error", reject);
    });

    const address = server.address();
    if (address == null || typeof address === "string") {
        throw new Error(`Unexpected server address: ${String(address)}`);
    }
    const port = address.port;
    const url = `http://localhost:${port}/openapi.json`;

    const cleanup = async () => {
        return new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
    return { server, port, url, cleanup };
}
