import IdempotencyHeaders

let client = SeedIdempotencyHeadersClient(token: "<token>")

try await client.payment.delete(
    paymentId: "paymentId"
)
