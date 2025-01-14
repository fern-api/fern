import { SeedLiteralClient } from "../..";

async function main() {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    await client.query.send({
        prompt: "You are a helpful assistant",
        optionalPrompt: "You are a helpful assistant",
        aliasPrompt: "You are a helpful assistant",
        aliasOptionalPrompt: "You are a helpful assistant",
        stream: false,
        optionalStream: false,
        aliasStream: false,
        aliasOptionalStream: false,
        query: "What is the weather today",
    });
}
main();
