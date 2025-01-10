import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.folder.service.unknownRequest({
        key: "value",
    });
}
main();
