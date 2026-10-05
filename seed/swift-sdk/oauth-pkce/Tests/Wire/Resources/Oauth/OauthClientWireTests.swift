import Foundation
import Testing
import OauthPkce

@Suite("OauthClient Wire Tests") struct OauthClientWireTests {
    @Test func authorize1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "code": "auth_code_xyz",
                  "state": "xyz"
                }
                """#.utf8
            )
        )
        let client = OauthPkceClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = AuthorizeResponse(
            code: "auth_code_xyz",
            state: Optional("xyz")
        )
        let response = try await client.oauth.authorize(
            responseType: .code,
            clientId: "client_abc123",
            redirectUri: "https://example.com/callback",
            codeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            codeChallengeMethod: .s256,
            scope: "read write",
            state: "xyz",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}