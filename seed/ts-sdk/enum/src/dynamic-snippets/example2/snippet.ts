import { SeedEnumClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedEnumClient({
        environment: "https://api.fern.com",
    });
    
    await client.pathParam.send(">", "red");
}
main();
