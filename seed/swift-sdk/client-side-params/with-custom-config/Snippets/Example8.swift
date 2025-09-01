import MyCustomModule

let client = MyCustomClient(token: "<token>")

private func main() async throws {
    try await client.service.listConnections(
        request: .init(
            strategy: "strategy",
            name: "name",
            fields: "fields"
        )
    )
}

try await main()
