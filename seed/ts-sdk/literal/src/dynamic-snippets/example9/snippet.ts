import { SeedLiteralClient } from "../..";

async function main() {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    await client.reference.send({
        prompt: "You are a helpful assistant",
        query: "query",
        stream: false,
        ending: "$ending",
        context: "You're super wise",
        maybeContext: "You're super wise",
        containerObject: {
            nestedObjects: [
                {
                    literal1: "literal1",
                    literal2: "literal2",
                    strProp: "strProp",
                },
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
