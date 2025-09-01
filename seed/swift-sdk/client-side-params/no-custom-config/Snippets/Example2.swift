import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

private func main() async throws {
    try await client.service.searchResources(
        request: .init(
            limit: 1,
            offset: 1,
            query: "query",
            filters: [
                "filters": .object([
                    "key": .string("value")
                ])
            ]
        )
    )
}

try await main()
