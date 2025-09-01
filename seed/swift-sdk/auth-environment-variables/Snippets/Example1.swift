import AuthEnvironmentVariables

let client = SeedAuthEnvironmentVariablesClient(apiKey: "<value>")

private func main() async throws {
    try await client.service.getWithHeader(
        request: .init(xEndpointHeader: "X-Endpoint-Header")
    )
}

try await main()
