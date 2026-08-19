import Foundation
import IdempotencyHeaders

enum Example1 {
    static func snippet() async throws {
        let client = IdempotencyHeadersClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.payment.delete(paymentId: "paymentId")
    }
}
