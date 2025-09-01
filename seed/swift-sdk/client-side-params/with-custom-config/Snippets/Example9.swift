import MyCustomModule

let client = MyCustomClient(token: "<token>")

try await client.service.getConnection(
    connectionId: "connectionId",
    request: .init(
        connectionId: "connectionId",
        fields: "fields"
    )
)
