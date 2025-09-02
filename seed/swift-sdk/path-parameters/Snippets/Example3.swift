import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient()

    try await client.user.getUser(
        userId: "user_id",
        request: .init(userId: "user_id")
    )
}

try await main()
