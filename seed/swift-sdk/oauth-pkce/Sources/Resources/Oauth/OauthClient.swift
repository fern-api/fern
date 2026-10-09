import Foundation

public final class OauthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Authorization-code grant with PKCE. `response_type` is a required literal that is
    /// hardcoded by the generated method; `code_challenge_method` is an optional literal
    /// that must still be sent on the wire when provided.
    ///
    /// ```swift
    /// import Foundation
    /// import OauthPkce
    ///
    /// private func main() async throws {
    ///     let client = OauthPkceClient()
    ///
    ///     _ = try await client.oauth.authorize(
    ///         responseType: .code,
    ///         clientId: "client_abc123",
    ///         redirectUri: "https://example.com/callback",
    ///         codeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    ///         codeChallengeMethod: .s256,
    ///         scope: "read write",
    ///         state: "xyz"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func authorize(responseType: Code, clientId: String, redirectUri: String, codeChallenge: String, codeChallengeMethod: S256? = nil, scope: String? = nil, state: String? = nil, requestOptions: RequestOptions? = nil) async throws -> AuthorizeResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/oauth/authorize",
            queryParams: [
                "response_type": .string(responseType.rawValue), 
                "client_id": .string(clientId), 
                "redirect_uri": .string(redirectUri), 
                "code_challenge": .string(codeChallenge), 
                "code_challenge_method": codeChallengeMethod.map { .string($0.rawValue) }, 
                "scope": scope.map { .string($0) }, 
                "state": state.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: AuthorizeResponse.self
        )
    }

    public enum Code: String, Codable, Hashable, CaseIterable, Sendable {
        case code
    }

    public enum S256: String, Codable, Hashable, CaseIterable, Sendable {
        case s256 = "S256"
    }
}