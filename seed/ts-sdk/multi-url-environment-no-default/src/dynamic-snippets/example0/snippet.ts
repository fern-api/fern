import { SeedMultiUrlEnvironmentNoDefaultClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedMultiUrlEnvironmentNoDefaultClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.ec2.bootInstance({
        size: "size",
    });
}
main();
