import { SeedUnionsClient } from "../..";

async function main() {
    const client = new SeedUnionsClient({
        environment: "https://api.fern.com",
    });
    await client.union.get("id");
}
main();
