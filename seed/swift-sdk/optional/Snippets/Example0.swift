import ObjectsWithImports

let client = SeedObjectsWithImportsClient()

try await client.optional.sendOptionalBody(
    request: [
        "string": .object([
            "key": .string("value")
        ])
    ]
)
