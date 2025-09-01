import PathParameters

let client = SeedPathParametersClient()

private func main() async throws {
    try await client.user.searchUsers(
        userId: "user_id",
        request: .init(
            userId: "user_id",
            limit: 1
        )
    )
}

try await main()
