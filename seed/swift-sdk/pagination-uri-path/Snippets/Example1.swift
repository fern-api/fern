import Foundation
import PaginationUriPath

private func main() async throws {
    let client = PaginationUriPathClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithPathPagination()
}

try await main()
