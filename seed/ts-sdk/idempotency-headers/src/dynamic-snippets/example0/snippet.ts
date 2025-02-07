import { SeedIdempotencyHeadersClient } from "../..";

async function main() {
    const client = new SeedIdempotencyHeadersClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.payment.create({
        amount: 1,
        currency: "USD",
    });
}
main();
