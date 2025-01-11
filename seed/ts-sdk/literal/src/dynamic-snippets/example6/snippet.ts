import { SeedLiteralClient } from "../..";

async function main() {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    await client.query.send({
        prompt: "You are a helpful assistant",
        stream: false,
        query: "What is the weather today",
    });
}
main();
