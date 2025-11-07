import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.getSearchResults(request: .init(
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
