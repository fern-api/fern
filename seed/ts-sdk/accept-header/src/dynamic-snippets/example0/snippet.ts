import { SeedAcceptClient } from "../..";

async function main() {
    const client = new SeedAcceptClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.service.endpoint();
}
main();
