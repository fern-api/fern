import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    try await client.user.searchUsers(
        userId: "user_id",
        limit: 1
    )
}

try await main()
