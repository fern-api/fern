import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.auth.getToken(request: .init(
    ///         clientId: "client_id",
    ///         clientSecret: "client_secret",
    ///         audience: .httpsApiExampleCom,
    ///         grantType: .clientCredentials
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getToken(request: Requests.GetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}