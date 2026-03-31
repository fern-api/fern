import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.pagination.listItems(
        cursor: "cursor",
        limit: 1
    )
}

try await main()
