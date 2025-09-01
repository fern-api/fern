import MyCustomModule

let client = MyCustomClient(token: "<token>")

private func main() async throws {
    try await client.service.listClients(
        request: .init(
            fields: "fields",
            includeFields: True,
            page: 1,
            perPage: 1,
            includeTotals: True,
            isGlobal: True,
            isFirstParty: True,
            appType: [
                "app_type",
                "app_type"
            ]
        )
    )
}

try await main()
