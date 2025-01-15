import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.query({
        namespace: "namespace",
        topK: 1,
        filter: {
            "filter": 1.1,
        },
        includeValues: true,
        includeMetadata: true,
        queries: [
            {
                values: [
                    1.1,
                    1.1,
                ],
                topK: 1,
                namespace: "namespace",
                filter: {
                    "filter": 1.1,
                },
                indexedData: {
                    indices: [
                        1,
                        1,
                    ],
                    values: [
                        1.1,
                        1.1,
                    ],
                },
            },
            {
                values: [
                    1.1,
                    1.1,
                ],
                topK: 1,
                namespace: "namespace",
                filter: {
                    "filter": 1.1,
                },
                indexedData: {
                    indices: [
                        1,
                        1,
                    ],
                    values: [
                        1.1,
                        1.1,
                    ],
                },
            },
        ],
        column: [
            1.1,
            1.1,
        ],
        id: "id",
        indexedData: {
            indices: [
                1,
                1,
            ],
            values: [
                1.1,
                1.1,
            ],
        },
    });
}
main();
