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
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func authorize2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "code": "code",
                  "state": "state"
                }
                """#.utf8
            )
        )
        let client = OauthPkceClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = AuthorizeResponse(
            code: "code",
            state: Optional("state")
        )
        let response = try await client.oauth.authorize(
            responseType: .code,
            clientId: "client_id",
            redirectUri: "redirect_uri",
            codeChallenge: "code_challenge",
            codeChallengeMethod: .s256,
            scope: "scope",
            state: "state",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}