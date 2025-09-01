import Extends

let client = SeedExtendsClient()

try await client.extendedInlineRequestBody(
    request: .init(
        name: "name",
        docs: "docs",
        unique: "unique"
    )
)
