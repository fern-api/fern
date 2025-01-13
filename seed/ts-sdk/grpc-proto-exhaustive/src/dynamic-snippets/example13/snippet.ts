import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.update({
        id: "id",
        values: [
            1.1,
            1.1,
        ],
        setMetadata: {
            "setMetadata": 1.1,
        },
        namespace: "namespace",
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
