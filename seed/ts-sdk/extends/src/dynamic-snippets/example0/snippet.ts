import { SeedExtendsClient } from "../..";

async function main() {
    const client = new SeedExtendsClient({
        environment: "https://api.fern.com",
    });
    await client.extendedInlineRequestBody({
        unique: "unique",
    });
}
main();
