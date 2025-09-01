import MultiLineDocs

private func main() async throws {
    let client = SeedMultiLineDocsClient()

    try await client.user.createUser(request: .init(
        name: "name",
        age: 1
    ))
}

try await main()
