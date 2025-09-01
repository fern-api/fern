import ObjectsWithImports

let client = SeedObjectsWithImportsClient()

private func main() async throws {
    try await client.optional.sendOptionalBody(
        request: [
            "string": .object([
                "key": .string("value")
            ])
        ]
    )
}

try await main()
