import { SeedCrossPackageTypeNamesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedCrossPackageTypeNamesClient({
        environment: "https://api.fern.com",
    });
    
    await client.folderA.service.getDirectThread();
}
main();
