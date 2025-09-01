import Variables

private func main() async throws {
    let client = SeedVariablesClient()

    try await client.service.post(endpointParam: "endpointParam")
}

try await main()
