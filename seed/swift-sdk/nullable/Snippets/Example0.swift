import Nullable

let client = SeedNullableClient()

private func main() async throws {
    try await client.nullable.getUsers(
        request: .init(
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
        )
    )
}

try await main()
