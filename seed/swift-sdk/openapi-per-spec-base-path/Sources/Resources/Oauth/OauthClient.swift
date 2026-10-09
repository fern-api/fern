import Foundation

public final class OauthClient: Sendable {
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
    ///     _ = try await client.oauth.getToken(request: .init(
    ///         clientId: "client_id",
    ///         clientSecret: "client_secret"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getToken(request: Requests.GetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> GetTokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/oauth/token",
            body: request,
            requestOptions: requestOptions,
            responseType: GetTokenResponse.self
        )
    }
}