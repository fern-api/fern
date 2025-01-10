import { SeedLiteralClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    
    await client.reference.send({
        query: "What is the weather today",
        containerObject: {
            nestedObjects: [
                {
                    strProp: "strProp",
                },
            ],
        },
    });
}
main();
