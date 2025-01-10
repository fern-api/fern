import { SeedLiteralClient } from "../..";

async function main() {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    await client.inlined.send({
        temperature: 10.1,
        prompt: "You are a helpful assistant",
        context: "You're super wise",
        aliasedContext: "You're super wise",
        maybeContext: "You're super wise",
        objectWithLiteral: {
            nestedLiteral: {
                myLiteral: "How super cool",
            },
        },
        stream: false,
        query: "What is the weather today",
    });
}
main();
