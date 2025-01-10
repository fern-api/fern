import { SeedAudiencesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedAudiencesClient({
        environment: "https://api.fern.com",
    });
    
    await client.folderD.service.getDirectThread();
}
main();
