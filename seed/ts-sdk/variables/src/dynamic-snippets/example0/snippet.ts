import { SeedVariablesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedVariablesClient({
        environment: "https://api.fern.com",
    });
    
    await client.service.post("endpointParam");
}
main();
