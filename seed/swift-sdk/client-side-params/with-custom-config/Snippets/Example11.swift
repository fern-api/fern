import MyCustomModule

let client = MyCustomClient(token: "<token>")

try await client.service.getClient(
    clientId: "clientId",
    request: .init(
        clientId: "clientId",
        fields: "fields",
        includeFields: True
    )
)
