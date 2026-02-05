import Foundation
import Testing
import OauthClientCredentialsReference

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getToken1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "expires_in": 3600
                }
                """.utf8
            )
        )
        let client = OauthClientCredentialsReferenceClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 3600
        )
        let response = try await client.auth.getToken(
            request: GetTokenRequest(
                clientId: "client_id",
                clientSecret: "client_secret"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getToken2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "expires_in": 1
                }
                """.utf8
            )
        )
        let client = OauthClientCredentialsReferenceClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1
        )
        let response = try await client.auth.getToken(
            request: GetTokenRequest(
                clientId: "client_id",
                clientSecret: "client_secret"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}