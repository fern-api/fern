import AliasExtends

let client = SeedAliasExtendsClient()

try await client.extendedInlineRequestBody(
    request: .init(
        parent: "parent",
        child: "child"
    )
)
