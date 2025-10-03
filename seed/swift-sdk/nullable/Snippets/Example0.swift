import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient(baseURL: "https://api.fern.com")

    try await client.nullable.getUsers(
        usernames: ,
        avatar: "avatar",
        activated: ,
        tags: ,
        extra: .value(true)
    )
}

try await main()
