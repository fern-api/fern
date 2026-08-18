import Foundation
import Api

enum Example3 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.requiredRefund(
            id: "id",
            request: RefundRequest(
                amount: 1.1
            )
        )
    }
}
