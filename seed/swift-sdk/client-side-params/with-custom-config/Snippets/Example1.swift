import MyCustomModule

let client = MyCustomClient(token: "<token>")

try await client.service.getResource(
    resourceId: "resourceId",
    request: .init(
        resourceId: "resourceId",
        includeMetadata: True,
        format: "json"
    )
)
