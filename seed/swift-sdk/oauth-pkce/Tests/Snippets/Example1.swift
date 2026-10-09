import Foundation
import OauthPkce

enum Example1 {
    static func snippet() async throws {
        let client = OauthPkceClient(baseURL: "https://api.fern.com")

        _ = try await client.oauth.authorize(
            responseType: .code,
            clientId: "client_id",
            redirectUri: "redirect_uri",
            codeChallenge: "code_challenge",
            codeChallengeMethod: .s256,
            scope: "scope",
            state: "state"
        )
    }
}
