import Foundation
import Testing
import Api

@Suite("OauthClient Wire Tests") struct OauthClientWireTests {
    @Test func getToken1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetTokenResponse(
            accessToken: "access_token",
            expiresIn: 1
        )
        let response = try await client.oauth.getToken(
            request: .init(
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
            body: Foundation.Data(
                #"""
                {
                  "access_token": "access_token",
                  "expires_in": 1
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = GetTokenResponse(
            accessToken: "access_token",
            expiresIn: 1
        )
        let response = try await client.oauth.getToken(
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}