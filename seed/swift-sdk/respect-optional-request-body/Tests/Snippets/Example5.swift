import Foundation
import Api

enum Example5 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.bulkRefund(request: RefundRequest(
            amount: 1.1
        ))
    }
}
