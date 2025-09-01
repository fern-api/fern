import SimpleApi

let client = SeedSimpleApiClient(token: "<token>")

private func main() async throws {
    try await client.user.get(
        id: "id"
    )
}

try await main()
