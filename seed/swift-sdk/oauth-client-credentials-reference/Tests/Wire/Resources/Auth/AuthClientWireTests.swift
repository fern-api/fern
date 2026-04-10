import Foundation
import Testing
import Api

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func gettoken1() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1
        )
        let response = try await client.auth.gettoken(
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func gettoken2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: 1
        )
        let response = try await client.auth.gettoken(
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}