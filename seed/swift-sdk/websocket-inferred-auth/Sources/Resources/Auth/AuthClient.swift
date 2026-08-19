import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import WebsocketAuth
    ///
    /// private func main() async throws {
    ///     let client = WebsocketAuthClient()
    ///
    ///     _ = try await client.auth.getTokenWithClientCredentials(
    ///         xApiKey: "X-Api-Key",
    ///         request: .init(
    ///             clientId: "client_id",
    ///             clientSecret: "client_secret",
    ///             audience: .httpsApiExampleCom,
    ///             grantType: .clientCredentials,
    ///             scope: "scope"
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getTokenWithClientCredentials(xApiKey: String, request: Requests.GetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            headers: [
                "X-Api-Key": xApiKey
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import WebsocketAuth
    ///
    /// private func main() async throws {
    ///     let client = WebsocketAuthClient()
    ///
    ///     _ = try await client.auth.refreshToken(
    ///         xApiKey: "X-Api-Key",
    ///         request: .init(
    ///             clientId: "client_id",
    ///             clientSecret: "client_secret",
    ///             refreshToken: "refresh_token",
    ///             audience: .httpsApiExampleCom,
    ///             grantType: .refreshToken,
    ///             scope: "scope"
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func refreshToken(xApiKey: String, request: Requests.RefreshTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token/refresh",
            headers: [
                "X-Api-Key": xApiKey
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}