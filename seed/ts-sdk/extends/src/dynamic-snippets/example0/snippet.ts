import { SeedExtendsClient } from "../..";

async function main() {
    const client = new SeedExtendsClient({
        environment: "https://api.fern.com",
    });
    await client.extendedInlineRequestBody({
        docs: "docs",
        name: "name",
        unique: "unique",
    });
}
main();
