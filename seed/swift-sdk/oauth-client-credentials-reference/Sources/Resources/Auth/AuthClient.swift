import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import OauthClientCredentialsReference
    /// 
    /// private func main() async throws {
    ///     let client = OauthClientCredentialsReferenceClient()
    /// 
    ///     _ = try await client.auth.getToken(request: GetTokenRequest(
    ///         clientId: "client_id",
    ///         clientSecret: "client_secret"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getToken(request: GetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}