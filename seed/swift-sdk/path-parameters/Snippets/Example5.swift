import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    try await client.user.updateUser(
        userId: "user_id",
        request: .init(
            userId: "user_id",
            body: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        )
    )
}

try await main()
