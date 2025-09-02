import Foundation
import Pagination

private func main() async throws {
    let client = SeedPaginationClient(token: "<token>")

    try await client.users.listWithOffsetStepPagination(request: .init(
        page: 1,
        limit: 1,
        order: .asc
    ))
}

try await main()
