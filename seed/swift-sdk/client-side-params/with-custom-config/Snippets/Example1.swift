import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.listresources(
        page: 1,
        perPage: 1,
        sort: "sort",
        order: "order",
        includeTotals: true,
        fields: .value("fields"),
        search: .value("search")
    )
}

try await main()
