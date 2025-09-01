import Version

let client = SeedVersionClient()

private func main() async throws {
    try await client.user.getUser(
        userId: "userId"
    )
}

try await main()
