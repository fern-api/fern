import PathParameters

private func main() async throws {
    let client = SeedPathParametersClient()

    try await client.user.getUser(
        userId: "user_id",
        request: .init(userId: "user_id")
    )
}

try await main()
