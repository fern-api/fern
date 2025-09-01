import NullableOptional

let client = SeedNullableOptionalClient()

private func main() async throws {
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
