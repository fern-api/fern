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
    ///     let client = ApiClient(token: "<token>")
    /// 
    ///     _ = try await client.auth.gettoken(request: .init(
    ///         clientId: "client_id",
    ///         clientSecret: "client_secret"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func gettoken(request: Requests.AuthGetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> AuthGetTokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/oauth/token",
            body: request,
            requestOptions: requestOptions,
            responseType: AuthGetTokenResponse.self
        )
    }
}