import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET request with custom api key
    ///
    /// ```swift
    /// import Foundation
    /// import BearerTokenEnvironmentVariable
    ///
    /// private func main() async throws {
    ///     let client = BearerTokenEnvironmentVariableClient(apiKey: "YOUR_API_KEY")
    ///
    ///     _ = try await client.service.getWithBearerToken()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithBearerToken(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/apiKey",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}