import { SeedExtraPropertiesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExtraPropertiesClient({
        environment: "https://api.fern.com",
    });
    
    await client.user.createUser({
        name: "name",
    });
}
main();
