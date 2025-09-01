import AliasExtends

let client = SeedAliasExtendsClient()

private func main() async throws {
    try await client.extendedInlineRequestBody(
        request: .init(
            parent: "parent",
            child: "child"
        )
    )
}

try await main()
