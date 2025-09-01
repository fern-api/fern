import InferredAuthExplicit

let client = SeedInferredAuthExplicitClient()

private func main() async throws {
    try await client.auth.getTokenWithClientCredentials(
        request: .init(
            xApiKey: "X-Api-Key",
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        )
    )
}

try await main()
