import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.service.refreshToken(request: RefreshTokenRequest(
        ttl: 420
    ))
}

try await main()
