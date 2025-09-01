import IdempotencyHeaders

private func main() async throws {
    let client = SeedIdempotencyHeadersClient(token: "<token>")

    try await client.payment.delete(paymentId: "paymentId")
}

try await main()
