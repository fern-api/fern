import Version

private func main() async throws {
    let client = SeedVersionClient()

    try await client.user.getUser(userId: "userId")
}

try await main()
