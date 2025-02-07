import { SeedExamplesClient } from "../..";

async function main() {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.service.createBigEntity({
        type: "and",
        u: {
            "u": "u",
        },
        v: new Set([
            "v",
        ]),
        value: true,
    });
}
main();
