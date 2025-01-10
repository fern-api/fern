import { SeedLiteralClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    
    await client.inlined.send({
        query: "query",
        temperature: 1.1,
        objectWithLiteral: {
            nestedLiteral: {},
        },
    });
}
main();
