import Foundation
import Testing
import OauthClientCredentials

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getToken1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """.utf8
            )
        )
        let client = OauthClientCredentialsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1,
            refreshToken: Optional("refresh_token")
        )
        let response = try await client.auth.getToken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        ))
        try #require(response == expectedResponse)
    }
}