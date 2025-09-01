import IdempotencyHeaders

let client = SeedIdempotencyHeadersClient(token: "<token>")

private func main() async throws {
    try await client.payment.delete(
        paymentId: "paymentId"
    )
}

try await main()
