import UndiscriminatedUnions

let client = SeedUndiscriminatedUnionsClient()

try await client.union.updateMetadata(
    request: MetadataUnion.optionalStringToJsonDictionary(
        [
            "string": .object([
                "key": .string("value")
            ])
        ]
    )
)
