import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.users.listUsernamesCustom(startingAfter: "starting_after")
}

try await main()
