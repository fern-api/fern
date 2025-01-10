import { SeedCustomAuthClient } from "../..";

async function main() {
    const client = new SeedCustomAuthClient({
        environment: "https://api.fern.com",
        customAuthScheme: "<value>",
    });
    await client.customAuth.getWithCustomAuth();
}
main();
