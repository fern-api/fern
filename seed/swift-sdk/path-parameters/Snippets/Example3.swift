import PathParameters

let client = SeedPathParametersClient()

private func main() async throws {
    try await client.user.getUser(
        userId: "user_id",
        request: .init(userId: "user_id")
    )
}

try await main()
