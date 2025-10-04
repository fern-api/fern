import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.listUsers(
        page: 1,
        perPage: 1,
        includeTotals: true,
        sort: "sort",
        connection: "connection",
        q: "q",
        searchEngine: "search_engine",
        fields: "fields"
    )
}

try await main()
