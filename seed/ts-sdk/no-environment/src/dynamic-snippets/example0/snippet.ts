import { SeedNoEnvironmentClient } from "../..";

async function main() {
    const client = new SeedNoEnvironmentClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.dummy.getDummy();
}
main();
