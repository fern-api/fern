import { SeedAliasClient } from "../..";

async function main() {
    const client = new SeedAliasClient({
        environment: "https://api.fern.com",
    });
    await client.get("typeId");
}
main();
