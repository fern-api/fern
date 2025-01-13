import { SeedLicenseClient } from "../..";

async function main() {
    const client = new SeedLicenseClient({
        environment: "https://api.fern.com",
    });
    await client.get();
}
main();
