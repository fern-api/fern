import UnknownAsAny

let client = SeedUnknownAsAnyClient()

try await client.unknown.post(
    request: .object([
        "key": .string("value")
    ])
)
