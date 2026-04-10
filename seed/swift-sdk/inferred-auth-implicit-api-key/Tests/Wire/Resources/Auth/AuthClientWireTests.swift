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
                  "token_type": "token_type",
                  "expires_in": 1,
                  "scope": "scope"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            tokenType: "token_type",
            expiresIn: 1,
            scope: Optional(Nullable<String>.value("scope"))
        )
        let response = try await client.auth.gettoken(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func gettoken2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "access_token": "access_token",
                  "token_type": "token_type",
                  "expires_in": 1,
                  "scope": "scope"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            tokenType: "token_type",
            expiresIn: 1,
            scope: Optional(Nullable<String>.value("scope"))
        )
        let response = try await client.auth.gettoken(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}