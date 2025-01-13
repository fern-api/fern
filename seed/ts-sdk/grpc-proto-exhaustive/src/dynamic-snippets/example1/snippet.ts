import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.upload({
        columns: [
            {
                id: "id",
                values: [
                    1.1,
                    1.1,
                ],
                metadata: {
                    "metadata": 1.1,
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
                id: "id",
                values: [
                    1.1,
                    1.1,
                ],
                metadata: {
                    "metadata": 1.1,
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
        namespace: "namespace",
    });
}
main();
