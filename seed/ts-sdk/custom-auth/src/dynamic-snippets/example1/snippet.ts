import { SeedCustomAuthClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedCustomAuthClient({
        environment: "https://api.fern.com",
        customAuthScheme: "<value>",
    });
    
    await client.customAuth.postWithCustomAuth({
        key: "value",
    });
}
main();
