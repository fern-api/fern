import { SeedIdempotencyHeadersClient } from "../..";

async function main(): Promise<void> {
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
