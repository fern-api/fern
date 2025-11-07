import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.updateTags(
        userId: "userId",
        request: .init(
            tags: [
                "tags",
                "tags"
            ],
            categories: [
                "categories",
                "categories"
            ],
            labels: [
                "labels",
                "labels"
            ]
        )
    )
}

try await main()
