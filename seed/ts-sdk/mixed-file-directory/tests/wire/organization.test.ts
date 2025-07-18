/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { mockServerPool } from "../mock-server/MockServerPool";
import { SeedMixedFileDirectoryClient } from "../../src/Client";

describe("Organization", () => {
    test("create", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedMixedFileDirectoryClient({ environment: server.baseUrl });
        const rawRequestBody = { name: "name" };
        const rawResponseBody = {
            id: "id",
            name: "name",
            users: [
                { id: "id", name: "name", age: 1 },
                { id: "id", name: "name", age: 1 },
            ],
        };
        server
            .mockEndpoint()
            .post("/organizations/")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.organization.create({
            name: "name",
        });
        expect(response).toEqual({
            id: "id",
            name: "name",
            users: [
                {
                    id: "id",
                    name: "name",
                    age: 1,
                },
                {
                    id: "id",
                    name: "name",
                    age: 1,
                },
            ],
        });
    });
});
