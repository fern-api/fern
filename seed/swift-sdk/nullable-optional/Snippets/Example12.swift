import NullableOptional

private func main() async throws {
    let client = SeedNullableOptionalClient()

    try await client.nullableOptional.getSearchResults(request: .init(
        query: "query",
        filters: [
            "filters": "filters"
        ],
        includeTypes: [
            "includeTypes",
            "includeTypes"
        ]
    ))
}

try await main()
