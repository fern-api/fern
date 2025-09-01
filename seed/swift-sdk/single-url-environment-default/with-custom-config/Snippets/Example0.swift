import SingleUrlEnvironmentDefault

let client = SeedSingleUrlEnvironmentDefaultClient(token: "<token>")

private func main() async throws {
    try await client.dummy.getDummy(

    )
}

try await main()
