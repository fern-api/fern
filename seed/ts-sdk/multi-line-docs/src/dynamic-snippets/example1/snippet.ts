import { SeedMultiLineDocsClient } from "../..";

async function main() {
    const client = new SeedMultiLineDocsClient({
        environment: "https://api.fern.com",
    });
    await client.user.createUser({
        name: "name",
        age: 1,
    });
}
main();
