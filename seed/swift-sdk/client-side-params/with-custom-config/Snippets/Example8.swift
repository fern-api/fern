import MyCustomModule

let client = MyCustomClient(token: "<token>")

try await client.service.listConnections(
    request: .init(
        strategy: "strategy",
        name: "name",
        fields: "fields"
    )
)
