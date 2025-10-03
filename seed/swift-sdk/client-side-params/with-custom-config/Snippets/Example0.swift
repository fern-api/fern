import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.listResources(
        page: 1,
        perPage: 1,
        sort: "created_at",
        order: "desc",
        includeTotals: true,
        fields: "fields",
        search: "search"
    )
}

try await main()
