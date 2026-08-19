import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import OauthClientCredentialsMandatoryAuth
    ///
    /// private func main() async throws {
    ///     let client = OauthClientCredentialsMandatoryAuthClient()
    ///
    ///     _ = try await client.auth.getTokenWithClientCredentials(request: .init(
    ///         clientId: "my_oauth_app_123",
    ///         clientSecret: "sk_live_abcdef123456789",
    ///         audience: .httpsApiExampleCom,
    ///         grantType: .clientCredentials,
    ///         scope: "read:users"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getTokenWithClientCredentials(request: Requests.GetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import OauthClientCredentialsMandatoryAuth
    ///
    /// private func main() async throws {
    ///     let client = OauthClientCredentialsMandatoryAuthClient()
    ///
    ///     _ = try await client.auth.getTokenWithClientCredentials(request: .init(
    ///         clientId: "my_oauth_app_123",
    ///         clientSecret: "sk_live_abcdef123456789",
    ///         audience: .httpsApiExampleCom,
    ///         grantType: .clientCredentials,
    ///         scope: "read:users"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func refreshToken(request: Requests.RefreshTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}