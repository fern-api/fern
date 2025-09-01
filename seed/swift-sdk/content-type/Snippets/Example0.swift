import ContentTypes

let client = SeedContentTypesClient()

try await client.service.patch(
    request: .init(
        application: "application",
        requireAuth: True
    )
)
