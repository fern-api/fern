import { SeedExhaustiveClient } from "../..";

async function main() {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.reqWithHeaders.getWithCustomHeader({
        "X-TEST-SERVICE-HEADER": "X-TEST-SERVICE-HEADER",
        "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
        body: "string",
    });
}
main();
