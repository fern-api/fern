import Foundation
import Testing
import OauthClientCredentials

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getTokenWithClientCredentials1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """#.utf8
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
        let response = try await client.auth.getTokenWithClientCredentials(
            request: .init(
                clientId: "my_oauth_app_123",
                clientSecret: "sk_live_abcdef123456789",
                audience: .httpsApiExampleCom,
                grantType: .clientCredentials,
                scope: "read:users"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func refreshToken1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1,
                  "refresh_token": "refresh_token"
                }
                """#.utf8
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
        let response = try await client.auth.refreshToken(
            request: .init(
                clientId: "my_oauth_app_123",
                clientSecret: "sk_live_abcdef123456789",
                refreshToken: "refresh_token",
                audience: .httpsApiExampleCom,
                grantType: .refreshToken,
                scope: "read:users"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}