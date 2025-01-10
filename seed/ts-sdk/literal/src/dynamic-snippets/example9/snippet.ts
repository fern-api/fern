import { SeedLiteralClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    
    await client.reference.send({
        query: "query",
        containerObject: {
            nestedObjects: [
                {
                    strProp: "strProp",
                },
                {
                    strProp: "strProp",
                },
            ],
        },
    });
}
main();
