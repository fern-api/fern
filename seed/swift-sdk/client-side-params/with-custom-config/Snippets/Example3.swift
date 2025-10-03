import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
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
