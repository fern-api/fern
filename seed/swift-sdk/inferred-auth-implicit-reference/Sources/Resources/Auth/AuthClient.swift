import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import InferredAuthImplicit
    /// 
    /// private func main() async throws {
    ///     let client = InferredAuthImplicitClient()
    /// 
    ///     _ = try await client.auth.getTokenWithClientCredentials(request: GetTokenRequest(
    ///         clientId: "client_id",
    ///         clientSecret: "client_secret",
    ///         audience: .httpsApiExampleCom,
    ///         grantType: .clientCredentials,
    ///         scope: "scope"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getTokenWithClientCredentials(request: GetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
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
    /// import InferredAuthImplicit
    /// 
    /// private func main() async throws {
    ///     let client = InferredAuthImplicitClient()
    /// 
    ///     _ = try await client.auth.refreshToken(request: RefreshTokenRequest(
    ///         clientId: "client_id",
    ///         clientSecret: "client_secret",
    ///         refreshToken: "refresh_token",
    ///         audience: .httpsApiExampleCom,
    ///         grantType: .refreshToken,
    ///         scope: "scope"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func refreshToken(request: RefreshTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token/refresh",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}