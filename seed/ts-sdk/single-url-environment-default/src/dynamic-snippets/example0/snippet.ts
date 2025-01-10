import { SeedSingleUrlEnvironmentDefaultClient } from "../..";

async function main() {
    const client = new SeedSingleUrlEnvironmentDefaultClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.dummy.getDummy();
}
main();
