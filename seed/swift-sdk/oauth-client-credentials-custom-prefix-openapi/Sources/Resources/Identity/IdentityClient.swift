import Foundation

public final class IdentityClient: Sendable {
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
    ///     _ = try await client.identity.getToken(request: .init(
    ///         username: "username",
    ///         password: "password"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getToken(request: Requests.GetTokenIdentityRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/identity/token",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}