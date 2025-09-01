import Api

let client = SeedApiClient()

try await client.folder.service.unknownRequest(
    request: .object([
        "key": .string("value")
    ])
)
