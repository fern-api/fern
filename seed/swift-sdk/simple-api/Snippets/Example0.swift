import SimpleApi

private func main() async throws {
    let client = SeedSimpleApiClient(token: "<token>")

    try await client.user.get(id: "id")
}

try await main()
