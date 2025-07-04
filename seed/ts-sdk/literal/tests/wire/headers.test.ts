/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { mockServerPool } from "../mock-server/MockServerPool";
import { SeedLiteralClient } from "../../src/Client";

describe("Headers", () => {
    test("send", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedLiteralClient({ environment: server.baseUrl });
        const rawRequestBody = { query: "What is the weather today" };
        const rawResponseBody = { message: "The weather is sunny", status: 200, success: true };
        server
            .mockEndpoint()
            .post("/headers")
            .header("X-Endpoint-Version", "02-12-2024")
            .header("X-Async", "true")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.headers.send({
            query: "What is the weather today",
        });
        expect(response).toEqual({
            message: "The weather is sunny",
            status: 200,
            success: true,
        });
    });
});
