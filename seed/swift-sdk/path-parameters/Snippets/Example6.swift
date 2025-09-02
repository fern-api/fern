import Foundation
import PathParameters

private func main() async throws {
    let client = SeedPathParametersClient()

    try await client.user.searchUsers(
        userId: "user_id",
        request: .init(
            userId: "user_id",
            limit: 1
        )
    )
}

try await main()
