import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.service.refreshToken(
        request: RefreshTokenRequest(
            ttl: 420
        )
    )
}

try await main()
