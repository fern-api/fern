import { OpenAPI } from "openapi-types";

import { generateDynamicIR } from "../generateDynamicIR";

describe("generateDynamicIR", () => {
    it("go", async () => {
        const openapi: OpenAPI.Document = {
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
        const ir = generateDynamicIR({
            spec: {
                type: "openapi",
                openapi,
                settings: {
                    filter: {
                        endpoints: ["GET /testdata"]
                    }
                }
            },
            language: "go"
        });
        expect(ir).toMatchSnapshot();
    });
});
