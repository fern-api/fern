import MultiLineDocs

let client = SeedMultiLineDocsClient()

private func main() async throws {
    try await client.user.getUser(
        userId: "userId"
    )
}

try await main()
