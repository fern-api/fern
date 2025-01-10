import { SeedMultiLineDocsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedMultiLineDocsClient({
        environment: "https://api.fern.com",
    });
    
    await client.user.getUser("userId");
}
main();
