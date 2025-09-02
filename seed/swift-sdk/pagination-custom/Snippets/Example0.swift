import Foundation
import Pagination

private func main() async throws {
    let client = SeedPaginationClient(token: "<token>")

    try await client.users.listUsernamesCustom(request: .init(startingAfter: "starting_after"))
}

try await main()
