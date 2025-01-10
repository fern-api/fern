import { SeedResponsePropertyClient } from "../..";

async function main() {
    const client = new SeedResponsePropertyClient({
        environment: "https://api.fern.com",
    });
    await client.service.getMovie("string");
}
main();
