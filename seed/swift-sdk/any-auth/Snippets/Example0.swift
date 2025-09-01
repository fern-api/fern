import AnyAuth

let client = SeedAnyAuthClient(token: "<token>")

private func main() async throws {
    try await client.auth.getToken(
        request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        )
    )
}

try await main()
