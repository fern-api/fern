import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.fetch({
        ids: [
            "ids",
        ],
        namespace: "namespace",
    });
}
main();
