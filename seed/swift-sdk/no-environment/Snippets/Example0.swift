import NoEnvironment

private func main() async throws {
    let client = SeedNoEnvironmentClient(token: "<token>")

    try await client.dummy.getDummy()
}

try await main()
