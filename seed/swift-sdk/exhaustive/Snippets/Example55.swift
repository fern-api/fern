import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsPagination.endpointsPaginationListItems(
        cursor: .value("cursor"),
        limit: .value(1)
    )
}

try await main()
