/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { mockServerPool } from "../../mock-server/MockServerPool";
import { SeedExhaustiveClient } from "../../../src/Client";

describe("Object_", () => {
    test("getAndReturnWithOptionalField", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedExhaustiveClient({ token: "test", environment: server.baseUrl });
        const rawRequestBody = {
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: "2024-01-15T09:30:00Z",
            date: "2023-01-15",
            uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            base64: "SGVsbG8gd29ybGQh",
            list: ["list", "list"],
            set: ["set"],
            map: { "1": "map" },
            bigint: "1000000",
        };
        const rawResponseBody = {
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: "2024-01-15T09:30:00Z",
            date: "2023-01-15",
            uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            base64: "SGVsbG8gd29ybGQh",
            list: ["list", "list"],
            set: ["set"],
            map: { "1": "map" },
            bigint: "1000000",
        };
        server
            .mockEndpoint()
            .post("/object/get-and-return-with-optional-field")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.endpoints.object.getAndReturnWithOptionalField({
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: "2024-01-15T09:30:00Z",
            date: "2023-01-15",
            uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            base64: "SGVsbG8gd29ybGQh",
            list: ["list", "list"],
            set: ["set"],
            map: {
                1: "map",
            },
            bigint: "1000000",
        });
        expect(response).toEqual({
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: "2024-01-15T09:30:00Z",
            date: "2023-01-15",
            uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            base64: "SGVsbG8gd29ybGQh",
            list: ["list", "list"],
            set: ["set"],
            map: {
                1: "map",
            },
            bigint: "1000000",
        });
    });

    test("getAndReturnWithRequiredField", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedExhaustiveClient({ token: "test", environment: server.baseUrl });
        const rawRequestBody = { string: "string" };
        const rawResponseBody = { string: "string" };
        server
            .mockEndpoint()
            .post("/object/get-and-return-with-required-field")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.endpoints.object.getAndReturnWithRequiredField({
            string: "string",
        });
        expect(response).toEqual({
            string: "string",
        });
    });

    test("getAndReturnWithMapOfMap", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedExhaustiveClient({ token: "test", environment: server.baseUrl });
        const rawRequestBody = { map: { map: { map: "map" } } };
        const rawResponseBody = { map: { map: { map: "map" } } };
        server
            .mockEndpoint()
            .post("/object/get-and-return-with-map-of-map")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.endpoints.object.getAndReturnWithMapOfMap({
            map: {
                map: {
                    map: "map",
                },
            },
        });
        expect(response).toEqual({
            map: {
                map: {
                    map: "map",
                },
            },
        });
    });

    test("getAndReturnNestedWithOptionalField", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedExhaustiveClient({ token: "test", environment: server.baseUrl });
        const rawRequestBody = {
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: { "1": "map" },
                bigint: "1000000",
            },
        };
        const rawResponseBody = {
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: { "1": "map" },
                bigint: "1000000",
            },
        };
        server
            .mockEndpoint()
            .post("/object/get-and-return-nested-with-optional-field")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.endpoints.object.getAndReturnNestedWithOptionalField({
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: {
                    1: "map",
                },
                bigint: "1000000",
            },
        });
        expect(response).toEqual({
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: {
                    1: "map",
                },
                bigint: "1000000",
            },
        });
    });

    test("getAndReturnNestedWithRequiredField", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedExhaustiveClient({ token: "test", environment: server.baseUrl });
        const rawRequestBody = {
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: { "1": "map" },
                bigint: "1000000",
            },
        };
        const rawResponseBody = {
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: { "1": "map" },
                bigint: "1000000",
            },
        };
        server
            .mockEndpoint()
            .post("/object/get-and-return-nested-with-required-field/string")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.endpoints.object.getAndReturnNestedWithRequiredField("string", {
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: {
                    1: "map",
                },
                bigint: "1000000",
            },
        });
        expect(response).toEqual({
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: {
                    1: "map",
                },
                bigint: "1000000",
            },
        });
    });

    test("getAndReturnNestedWithRequiredFieldAsList", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedExhaustiveClient({ token: "test", environment: server.baseUrl });
        const rawRequestBody = [
            {
                string: "string",
                NestedObject: {
                    string: "string",
                    integer: 1,
                    long: 1000000,
                    double: 1.1,
                    bool: true,
                    datetime: "2024-01-15T09:30:00Z",
                    date: "2023-01-15",
                    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    base64: "SGVsbG8gd29ybGQh",
                    list: ["list", "list"],
                    set: ["set"],
                    map: { "1": "map" },
                    bigint: "1000000",
                },
            },
            {
                string: "string",
                NestedObject: {
                    string: "string",
                    integer: 1,
                    long: 1000000,
                    double: 1.1,
                    bool: true,
                    datetime: "2024-01-15T09:30:00Z",
                    date: "2023-01-15",
                    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    base64: "SGVsbG8gd29ybGQh",
                    list: ["list", "list"],
                    set: ["set"],
                    map: { "1": "map" },
                    bigint: "1000000",
                },
            },
        ];
        const rawResponseBody = {
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: { "1": "map" },
                bigint: "1000000",
            },
        };
        server
            .mockEndpoint()
            .post("/object/get-and-return-nested-with-required-field-list")
            .jsonBody(rawRequestBody)
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([
            {
                string: "string",
                NestedObject: {
                    string: "string",
                    integer: 1,
                    long: 1000000,
                    double: 1.1,
                    bool: true,
                    datetime: "2024-01-15T09:30:00Z",
                    date: "2023-01-15",
                    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    base64: "SGVsbG8gd29ybGQh",
                    list: ["list", "list"],
                    set: ["set"],
                    map: {
                        1: "map",
                    },
                    bigint: "1000000",
                },
            },
            {
                string: "string",
                NestedObject: {
                    string: "string",
                    integer: 1,
                    long: 1000000,
                    double: 1.1,
                    bool: true,
                    datetime: "2024-01-15T09:30:00Z",
                    date: "2023-01-15",
                    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    base64: "SGVsbG8gd29ybGQh",
                    list: ["list", "list"],
                    set: ["set"],
                    map: {
                        1: "map",
                    },
                    bigint: "1000000",
                },
            },
        ]);
        expect(response).toEqual({
            string: "string",
            NestedObject: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: {
                    1: "map",
                },
                bigint: "1000000",
            },
        });
    });
});
