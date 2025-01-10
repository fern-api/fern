import { SeedMultiUrlEnvironmentClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedMultiUrlEnvironmentClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.s3.getPresignedUrl({
        s3Key: "s3Key",
    });
}
main();
