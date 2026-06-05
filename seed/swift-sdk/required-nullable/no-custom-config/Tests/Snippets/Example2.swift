import Foundation
import Api

enum Example2 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.updateFoo(
            id: "id",
            request: .init(
                nullableText: .value("nullable_text"),
                nullableNumber: .value(1.1),
                nonNullableText: "non_nullable_text"
            )
        )
    }
}
