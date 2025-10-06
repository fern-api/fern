import Foundation
import Testing
import WebsocketAuth

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getTokenWithClientCredentials1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "refresh_token": "refresh_token"
                }
                """.utf8
            )
        )
        let client = WebsocketAuthClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            refreshToken: "refresh_token"
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
                  "refresh_token": "refresh_token"
                }
                """.utf8
            )
        )
        let client = WebsocketAuthClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            refreshToken: "refresh_token"
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