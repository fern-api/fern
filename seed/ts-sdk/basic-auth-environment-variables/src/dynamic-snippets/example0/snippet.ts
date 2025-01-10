import { SeedBasicAuthEnvironmentVariablesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedBasicAuthEnvironmentVariablesClient({
        environment: "https://api.fern.com",
        username: "<username>",
        password: "<password>",
    });
    
    await client.basicAuth.getWithBasicAuth();
}
main();
