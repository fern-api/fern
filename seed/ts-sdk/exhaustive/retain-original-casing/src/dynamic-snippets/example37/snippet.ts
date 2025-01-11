import { SeedExhaustiveClient } from "../..";

async function main() {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.endpoints.primitive.getAndReturnBase64("SGVsbG8gd29ybGQh");
}
main();
