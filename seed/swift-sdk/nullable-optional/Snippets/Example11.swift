import NullableOptional

let client = SeedNullableOptionalClient()

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
