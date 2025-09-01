import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.service.refreshToken(request: RefreshTokenRequest(

    ))
}

try await main()
