import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

private func main() async throws {
    try await client.service.getUserById(
        userId: "userId",
        request: .init(
            userId: "userId",
            fields: "fields",
            includeFields: True
        )
    )
}

try await main()
