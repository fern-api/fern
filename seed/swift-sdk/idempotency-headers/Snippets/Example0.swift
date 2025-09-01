import IdempotencyHeaders

let client = SeedIdempotencyHeadersClient(token: "<token>")

try await client.payment.create(
    request: .init(
        amount: 1,
        currency: .usd
    )
)
