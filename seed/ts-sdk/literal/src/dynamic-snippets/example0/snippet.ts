import { SeedLiteralClient } from "../..";

async function main() {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    await client.headers.send({
        endpointVersion: "02-12-2024",
        async: true,
        query: "What is the weather today",
    });
}
main();
