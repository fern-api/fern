import Extends

let client = SeedExtendsClient()

private func main() async throws {
    try await client.extendedInlineRequestBody(
        request: .init(
            name: "name",
            docs: "docs",
            unique: "unique"
        )
    )
}

try await main()
