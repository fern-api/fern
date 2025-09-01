import NullableOptional

let client = SeedNullableOptionalClient()

private func main() async throws {
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
}

try await main()
