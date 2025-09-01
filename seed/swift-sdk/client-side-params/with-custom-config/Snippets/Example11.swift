import MyCustomModule

let client = MyCustomClient(token: "<token>")

private func main() async throws {
    try await client.service.getClient(
        clientId: "clientId",
        request: .init(
            clientId: "clientId",
            fields: "fields",
            includeFields: True
        )
    )
}

try await main()
