import PathParameters

let client = SeedPathParametersClient()

try await client.user.getUser(
    userId: "user_id",
    request: .init(userId: "user_id")
)
