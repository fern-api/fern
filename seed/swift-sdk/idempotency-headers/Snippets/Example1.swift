import Foundation
import IdempotencyHeaders

private func main() async throws {
    let client = IdempotencyHeadersClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.payment.delete(paymentId: "paymentId")
}

try await main()
