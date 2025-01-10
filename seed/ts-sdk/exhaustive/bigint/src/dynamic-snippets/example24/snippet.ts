import { SeedExhaustiveClient } from "../..";

async function main() {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.endpoints.params.getWithAllowMultipleQuery({
        query: [
            "query",
        ],
        numer: [
            1,
        ],
    });
}
main();
