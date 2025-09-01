import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

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
