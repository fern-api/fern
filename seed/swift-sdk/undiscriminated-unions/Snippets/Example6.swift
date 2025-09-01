import UndiscriminatedUnions

let client = SeedUndiscriminatedUnionsClient()

try await client.union.nestedUnions(
    request: NestedUnionRoot.string(
        "string"
    )
)
