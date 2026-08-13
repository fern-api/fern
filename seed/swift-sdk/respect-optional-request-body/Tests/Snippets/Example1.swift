import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.refund(
            id: "id",
            request: RefundRequest(
                amount: 1.1
            )
        )
    }
}
