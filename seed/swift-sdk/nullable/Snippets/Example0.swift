import Nullable

let client = SeedNullableClient()

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
