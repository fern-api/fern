import { SeedPlainTextClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedPlainTextClient({
        environment: "https://api.fern.com",
    });
    
    await client.service.getText();
}
main();
