import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.service.refreshToken(
    request: RefreshTokenRequest(

    )
)
