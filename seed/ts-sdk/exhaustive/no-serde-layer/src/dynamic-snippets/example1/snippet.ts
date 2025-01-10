import { SeedExhaustiveClient } from "../..";

async function main() {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.endpoints.container.getAndReturnListOfObjects([
        {
            string: "string",
        },
        {
            string: "string",
        },
    ]);
}
main();
