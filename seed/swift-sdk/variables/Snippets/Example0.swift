import Variables

let client = SeedVariablesClient()

private func main() async throws {
    try await client.service.post(
        endpointParam: "endpointParam"
    )
}

try await main()
