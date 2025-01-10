import { SeedErrorPropertyClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedErrorPropertyClient({
        environment: "https://api.fern.com",
    });
    
    await client.propertyBasedError.throwError();
}
main();
