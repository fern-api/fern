import NoEnvironment

let client = SeedNoEnvironmentClient(token: "<token>")

private func main() async throws {
    try await client.dummy.getDummy(

    )
}

try await main()
