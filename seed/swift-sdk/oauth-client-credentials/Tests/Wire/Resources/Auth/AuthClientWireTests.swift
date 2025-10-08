import Foundation
import Testing
import OauthClientCredentials

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getTokenWithClientCredentials1() async throws -> Void {
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
        let response = try await client.auth.getTokenWithClientCredentials(request: .init(
            clientId: "my_oauth_app_123",
            clientSecret: "sk_live_abcdef123456789",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "read:users"
        ))
        try #require(response == expectedResponse)
    }

    @Test func getTokenWithClientCredentials2() async throws -> Void {
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
        let response = try await client.auth.getTokenWithClientCredentials(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        ))
        try #require(response == expectedResponse)
    }

    @Test func refreshToken1() async throws -> Void {
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
        let response = try await client.auth.refreshToken(request: .init(
            clientId: "my_oauth_app_123",
            clientSecret: "sk_live_abcdef123456789",
            refreshToken: "refresh_token",
            audience: .httpsApiExampleCom,
            grantType: .refreshToken,
            scope: "read:users"
        ))
        try #require(response == expectedResponse)
    }

    @Test func refreshToken2() async throws -> Void {
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
        let response = try await client.auth.refreshToken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            refreshToken: "refresh_token",
            audience: .httpsApiExampleCom,
            grantType: .refreshToken,
            scope: "scope"
        ))
        try #require(response == expectedResponse)
    }
}