import UnknownAsAny

let client = SeedUnknownAsAnyClient()

try await client.unknown.postObject(
    request: MyObject(
        unknown: .object([
            "key": .string("value")
        ])
    )
)
