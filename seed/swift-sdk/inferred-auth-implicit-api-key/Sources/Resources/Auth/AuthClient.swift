import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import InferredAuthImplicitApiKey
    /// 
    /// private func main() async throws {
    ///     let client = InferredAuthImplicitApiKeyClient()
    /// 
    ///     _ = try await client.auth.getToken(apiKey: "api_key")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getToken(apiKey: String, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            headers: [
                "X-Api-Key": apiKey
            ],
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}