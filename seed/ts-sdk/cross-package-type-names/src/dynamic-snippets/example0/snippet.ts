import { SeedCrossPackageTypeNamesClient } from "../..";

async function main() {
    const client = new SeedCrossPackageTypeNamesClient({
        environment: "https://api.fern.com",
    });
    await client.folderA.service.getDirectThread();
}
main();
