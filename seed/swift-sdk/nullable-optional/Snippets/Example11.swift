import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    try await client.nullableOptional.updateTags(
        userId: "userId",
        request: .init(
            userId: "userId",
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
