import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.updateFoo(
        id: "id",
        request: .init(
            nullableText: "nullable_text",
            nullableNumber: 1.1,
            nonNullableText: "non_nullable_text"
        )
    )
}

try await main()
