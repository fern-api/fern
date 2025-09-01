import UndiscriminatedUnions

let client = SeedUndiscriminatedUnionsClient()

try await client.union.duplicateTypesUnion(
    request: UnionWithDuplicateTypes.string(
        "string"
    )
)
