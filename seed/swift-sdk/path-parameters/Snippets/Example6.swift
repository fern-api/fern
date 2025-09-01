import PathParameters

let client = SeedPathParametersClient()

try await client.user.searchUsers(
    userId: "user_id",
    request: .init(
        userId: "user_id",
        limit: 1
    )
)
