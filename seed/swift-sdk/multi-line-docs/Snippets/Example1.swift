import MultiLineDocs

let client = SeedMultiLineDocsClient()

private func main() async throws {
    try await client.user.createUser(
        request: .init(
            name: "name",
            age: 1
        )
    )
}

try await main()
