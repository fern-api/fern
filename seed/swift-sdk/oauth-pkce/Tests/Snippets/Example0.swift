import Foundation
import OauthPkce

enum Example0 {
    static func snippet() async throws {
        let client = OauthPkceClient(baseURL: "https://api.fern.com")

        _ = try await client.oauth.authorize(
            responseType: .code,
            clientId: "client_abc123",
            redirectUri: "https://example.com/callback",
            codeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            codeChallengeMethod: .s256,
            scope: "read write",
            state: "xyz"
        )
    }
}
