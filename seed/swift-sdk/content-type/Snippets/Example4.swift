import ContentTypes

let client = SeedContentTypesClient()

private func main() async throws {
    try await client.service.regularPatch(
        id: "id",
        request: .init(
            id: "id",
            field1: "field1",
            field2: 1
        )
    )
}

try await main()
