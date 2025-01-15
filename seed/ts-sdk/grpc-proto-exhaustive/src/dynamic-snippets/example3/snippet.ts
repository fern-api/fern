import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.delete({
        ids: [
            "ids",
            "ids",
        ],
        deleteAll: true,
        namespace: "namespace",
        filter: {
            "filter": 1.1,
        },
    });
}
main();
