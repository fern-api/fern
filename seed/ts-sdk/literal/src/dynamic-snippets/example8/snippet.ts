import { SeedLiteralClient } from "../..";

async function main() {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    await client.reference.send({
        prompt: "You are a helpful assistant",
        stream: false,
        context: "You're super wise",
        query: "What is the weather today",
        containerObject: {
            nestedObjects: [
                {
                    literal1: "literal1",
                    literal2: "literal2",
                    strProp: "strProp",
                },
            ],
        },
    });
}
main();
