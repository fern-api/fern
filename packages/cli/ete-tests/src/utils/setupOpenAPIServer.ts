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

export function setupOpenAPIServer(): { server: http.Server; cleanup: () => Promise<void> } {
    const app = express();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.get("/openapi.json", (req: any, res: any) => {
        res.json(TEST_OPENAPI_DOCUMENT);
    });

    const server = app.listen(4567);
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
    return { server, cleanup };
}
