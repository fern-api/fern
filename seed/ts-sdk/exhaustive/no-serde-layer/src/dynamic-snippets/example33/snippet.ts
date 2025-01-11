import { SeedExhaustiveClient } from "../..";

async function main() {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.endpoints.primitive.getAndReturnBool(true);
}
main();
