import Foundation
import Testing
import InferredAuthImplicitApiKey

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getToken1() async throws -> Void {
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
        let client = InferredAuthImplicitApiKeyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            tokenType: "token_type",
            expiresIn: 1,
            scope: Optional("scope")
        )
        let response = try await client.auth.getToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}