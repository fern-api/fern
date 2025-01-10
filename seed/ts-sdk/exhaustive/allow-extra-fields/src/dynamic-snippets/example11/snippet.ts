import { SeedExhaustiveClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.endpoints.httpMethods.testPost({
        string: "string",
    });
}
main();
