import Foundation
import Testing
import AnyAuth

@Suite("AuthClient Wire Tests") struct AuthClientWireTests {
    @Test func getToken1() async throws -> Void {
        let stub = HTTPStub()
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
        let client = AnyAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TokenResponse(
            accessToken: "access_token",
            expiresIn: Optional(1),
            refreshToken: Optional("refresh_token")
        )
        let response = try await client.auth.getToken(
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                audience: .httpsApiExampleCom,
                grantType: .authorizationCode,
                scope: "scope"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}