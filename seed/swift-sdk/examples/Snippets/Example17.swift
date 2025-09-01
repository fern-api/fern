import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.service.getMetadata(
    request: .init(
        shallow: True,
        tag: [
            "tag"
        ],
        xApiVersion: "X-API-Version"
    )
)
