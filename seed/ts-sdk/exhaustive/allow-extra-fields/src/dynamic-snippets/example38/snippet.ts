import { SeedExhaustiveClient } from "../..";

async function main() {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.endpoints.union.getAndReturnUnion({
        animal: "dog",
        name: "name",
        likesToWoof: true,
    });
}
main();
