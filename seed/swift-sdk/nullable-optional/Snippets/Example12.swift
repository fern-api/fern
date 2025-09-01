import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.getSearchResults(
    request: .init(
        query: "query",
        filters: [
            "filters": "filters"
        ],
        includeTypes: [
            "includeTypes",
            "includeTypes"
        ]
    )
)
