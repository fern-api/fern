import { SeedValidationClient } from "../..";

async function main() {
    const client = new SeedValidationClient({
        environment: "https://api.fern.com",
    });
    await client.create({
        decimal: 2.2,
        even: 100,
        name: "foo",
        shape: "SQUARE",
    });
}
main();
