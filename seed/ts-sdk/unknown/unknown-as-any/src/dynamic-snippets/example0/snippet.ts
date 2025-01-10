import { SeedUnknownAsAnyClient } from "../..";

async function main() {
    const client = new SeedUnknownAsAnyClient({
        environment: "https://api.fern.com",
    });
    await client.unknown.post({
        key: "value",
    });
}
main();
