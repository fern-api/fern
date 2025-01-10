import { SeedMultiLineDocsClient } from "../..";

async function main() {
    const client = new SeedMultiLineDocsClient({
        environment: "https://api.fern.com",
    });
    await client.user.getUser("userId");
}
main();
