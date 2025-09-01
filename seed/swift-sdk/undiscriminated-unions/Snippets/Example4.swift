import UndiscriminatedUnions

private func main() async throws {
    let client = SeedUndiscriminatedUnionsClient()

    try await client.union.call(request: Request(
        union: MetadataUnion.optionalStringToJsonDictionary(
            [
                "union": .object([
                    "key": .string("value")
                ])
            ]
        )
    ))
}

try await main()
