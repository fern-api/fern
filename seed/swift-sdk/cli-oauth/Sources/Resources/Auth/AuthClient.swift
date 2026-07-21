import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.auth.getToken(request: .init(
    ///         clientId: "client_id",
    ///         clientSecret: "client_secret",
    ///         scopes: "scopes",
    ///         grantType: .clientCredentials,
    ///         tenant: "tenant"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getToken(audience: GetTokenAuthRequestAudience? = nil, request: Requests.GetTokenAuthRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            queryParams: [
                "audience": audience.map { .string($0.rawValue) }
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.auth.refreshToken(request: .init(
    ///         refreshToken: "refresh_token",
    ///         grantType: .refreshToken
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func refreshToken(request: Requests.RefreshTokenAuthRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/refresh",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}