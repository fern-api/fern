import { SeedAliasExtendsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedAliasExtendsClient({
        environment: "https://api.fern.com",
    });
    
    await client.extendedInlineRequestBody({
        child: "child",
    });
}
main();
