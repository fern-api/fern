import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.listResources(
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
