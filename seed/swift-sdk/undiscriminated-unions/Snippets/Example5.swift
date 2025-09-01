import UndiscriminatedUnions

private func main() async throws {
    let client = SeedUndiscriminatedUnionsClient()

    try await client.union.duplicateTypesUnion(request: UnionWithDuplicateTypes.string(
        "string"
    ))
}

try await main()
