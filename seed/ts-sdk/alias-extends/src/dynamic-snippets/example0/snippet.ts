import { SeedAliasExtendsClient } from "../..";

async function main() {
    const client = new SeedAliasExtendsClient({
        environment: "https://api.fern.com",
    });
    await client.extendedInlineRequestBody({
        parent: "parent",
        child: "child",
    });
}
main();
