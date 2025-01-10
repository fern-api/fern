import { SeedSingleUrlEnvironmentNoDefaultClient } from "../..";

async function main() {
    const client = new SeedSingleUrlEnvironmentNoDefaultClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.dummy.getDummy();
}
main();
