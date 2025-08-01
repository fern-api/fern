/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { mockServerPool } from "../mock-server/MockServerPool";
import { SeedSingleUrlEnvironmentNoDefaultClient } from "../../src/Client";

describe("Dummy", () => {
    test("getDummy", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedSingleUrlEnvironmentNoDefaultClient({ token: "test", environment: server.baseUrl });

        const rawResponseBody = "string";
        server.mockEndpoint().get("/dummy").respondWith().statusCode(200).jsonBody(rawResponseBody).build();

        const response = await client.dummy.getDummy();
        expect(response).toEqual("string");
    });
});
