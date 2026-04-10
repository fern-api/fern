import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithAliasedData(
        page: 1,
        perPage: 1,
        startingAfter: "starting_after"
    )
}

try await main()
