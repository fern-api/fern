import MultiLineDocs

private func main() async throws {
    let client = SeedMultiLineDocsClient()

    try await client.user.getUser(userId: "userId")
}

try await main()
