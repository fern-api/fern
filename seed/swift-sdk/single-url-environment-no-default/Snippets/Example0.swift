import SingleUrlEnvironmentNoDefault

let client = SeedSingleUrlEnvironmentNoDefaultClient(token: "<token>")

private func main() async throws {
    try await client.dummy.getDummy(

    )
}

try await main()
