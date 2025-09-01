import ContentTypes

let client = SeedContentTypesClient()

private func main() async throws {
    try await client.service.namedPatchWithMixed(
        id: "id",
        request: .init(
            id: "id",
            appId: "appId",
            instructions: "instructions",
            active: True
        )
    )
}

try await main()
