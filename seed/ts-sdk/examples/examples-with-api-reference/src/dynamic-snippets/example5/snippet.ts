import { SeedExamplesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.file.service.getFile("file.txt", {
        xFileApiVersion: "0.0.2",
    });
}
main();
