import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.userservice.create({
        username: "username",
        email: "email",
        age: 1,
        weight: 1.1,
        metadata: {
            "metadata": 1.1,
        },
    });
}
main();
