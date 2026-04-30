import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    _ = try await client.user.updateUser(
        userId: "user_id",
        request: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
    )
}

try await main()
