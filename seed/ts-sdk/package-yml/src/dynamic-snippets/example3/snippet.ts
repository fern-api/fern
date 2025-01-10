import { SeedPackageYmlClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedPackageYmlClient({
        environment: "https://api.fern.com",
    });
    
    await client.service.nop("id", "nestedId");
}
main();
