import { SeedApiWideBasePathClient } from "../..";

async function main() {
    const client = new SeedApiWideBasePathClient({
        environment: "https://api.fern.com",
    });
    await client.service.post("pathParam", "serviceParam", "resourceParam", 1);
}
main();
