import IdempotencyHeaders

let client = SeedIdempotencyHeadersClient(token: "<token>")

private func main() async throws {
    try await client.payment.create(
        request: .init(
            amount: 1,
            currency: .usd
        )
    )
}

try await main()
