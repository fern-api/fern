import { SeedVariablesClient } from "../..";

async function main() {
    const client = new SeedVariablesClient({
        environment: "https://api.fern.com",
    });
    await client.service.post("endpointParam");
}
main();
