import { SeedLiteralClient } from "../..";

async function main() {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    await client.inlined.send({
        prompt: "You are a helpful assistant",
        context: "You're super wise",
        query: "query",
        temperature: 1.1,
        stream: false,
        aliasedContext: "You're super wise",
        maybeContext: "You're super wise",
        objectWithLiteral: {
            nestedLiteral: {
                myLiteral: "How super cool",
            },
        },
    });
}
main();
