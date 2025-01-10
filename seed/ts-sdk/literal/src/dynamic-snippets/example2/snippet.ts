import { SeedLiteralClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    
    await client.inlined.send({
        temperature: 10.1,
        objectWithLiteral: {
            nestedLiteral: {},
        },
        query: "What is the weather today",
    });
}
main();
