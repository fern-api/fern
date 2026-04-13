import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listwithcustompager(
        limit: .value(1),
        startingAfter: .value("starting_after")
    )
}

try await main()
