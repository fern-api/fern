import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.listusers(
        page: .value(1),
        perPage: .value(1),
        includeTotals: .value(true),
        sort: .value("sort"),
        connection: .value("connection"),
        q: .value("q"),
        searchEngine: .value("search_engine"),
        fields: .value("fields")
    )
}

try await main()
