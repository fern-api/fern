import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = SeedOauthClientCredentialsWithVariablesClient()

    try await client.service.post(endpointParam: "endpointParam")
}

try await main()
