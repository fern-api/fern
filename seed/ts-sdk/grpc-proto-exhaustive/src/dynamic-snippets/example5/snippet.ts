import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.describe({
        filter: {
            "filter": 1.1,
        },
    });
}
main();
