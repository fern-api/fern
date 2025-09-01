import SingleUrlEnvironmentNoDefault

private func main() async throws {
    let client = SeedSingleUrlEnvironmentNoDefaultClient(token: "<token>")

    try await client.dummy.getDummy()
}

try await main()
