import Foundation
import IdempotencyHeaders

private func main() async throws {
    let client = SeedIdempotencyHeadersClient(token: "<token>")

    try await client.payment.create(request: .init(
        amount: 1,
        currency: .usd
    ))
}

try await main()
