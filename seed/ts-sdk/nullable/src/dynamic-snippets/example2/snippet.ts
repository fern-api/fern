import { SeedNullableClient } from "../..";

async function main() {
    const client = new SeedNullableClient({
        environment: "https://api.fern.com",
    });
    await client.nullable.deleteUser({
        username: "xy",
    });
}
main();
