import { SeedValidationClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedValidationClient({
        environment: "https://api.fern.com",
    });
    
    await client.get({
        decimal: 2.2,
        even: 100,
        name: "foo",
    });
}
main();
