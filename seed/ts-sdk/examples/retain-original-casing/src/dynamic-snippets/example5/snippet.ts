import { SeedExamplesClient } from "../..";

async function main() {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.file.service.getFile("file.txt", {
        "X-File-API-Version": "0.0.2",
    });
}
main();
