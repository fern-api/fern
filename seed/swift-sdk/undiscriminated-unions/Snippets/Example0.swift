import UndiscriminatedUnions

let client = SeedUndiscriminatedUnionsClient()

try await client.union.get(
    request: MyUnion.string(
        "string"
    )
)
