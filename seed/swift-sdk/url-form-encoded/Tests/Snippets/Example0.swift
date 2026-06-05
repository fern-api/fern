import Foundation
import Api

enum Example0 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.submitFormData(request: .init(
            username: "johndoe",
            email: "john@example.com"
        ))
    }
}
