import ContentTypes

let client = SeedContentTypesClient()

try await client.service.regularPatch(
    id: "id",
    request: .init(
        id: "id",
        field1: "field1",
        field2: 1
    )
)
