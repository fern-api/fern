import ContentTypes

let client = SeedContentTypesClient()

try await client.service.namedPatchWithMixed(
    id: "id",
    request: .init(
        id: "id",
        appId: "appId",
        instructions: "instructions",
        active: True
    )
)
