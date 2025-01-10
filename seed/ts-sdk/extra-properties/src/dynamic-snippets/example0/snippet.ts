import { SeedExtraPropertiesClient } from "../..";

async function main() {
    const client = new SeedExtraPropertiesClient({
        environment: "https://api.fern.com",
    });
    await client.user.createUser({
        type: "CreateUserRequest",
        version: "v1",
        name: "name",
    });
}
main();
