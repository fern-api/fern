import Foundation
import ClientSideParams

private func main() async throws {
    let client = SeedClientSideParamsClient(token: "<token>")

    try await client.service.listUsers(request: .init(
        page: 1,
        perPage: 1,
        includeTotals: True,
        sort: "sort",
        connection: "connection",
        q: "q",
        searchEngine: "search_engine",
        fields: "fields"
    ))
}

try await main()
