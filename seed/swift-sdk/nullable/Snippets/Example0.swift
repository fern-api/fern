import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient(baseURL: "https://api.fern.com")

    try await client.nullable.getUsers(request: .init(
        usernames: [
            "usernames"
        ],
        avatar: "avatar",
        activated: [
            True
        ],
        tags: [
            "tags"
        ],
        extra: True
    ))
}

try await main()
