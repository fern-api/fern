import { SeedPlainTextClient } from "../..";

async function main() {
    const client = new SeedPlainTextClient({
        environment: "https://api.fern.com",
    });
    await client.service.getText();
}
main();
