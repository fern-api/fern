/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { mockServerPool } from "../mock-server/MockServerPool";
import { SeedNurseryApiClient } from "../../src/Client";

describe("Package", () => {
    test("test", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedNurseryApiClient({ environment: server.baseUrl });

        server.mockEndpoint().post("").respondWith().statusCode(200).build();

        const response = await client.package.test({
            for: "for",
        });
        expect(response).toEqual(undefined);
    });
});
