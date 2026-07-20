import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET request with a version header
    ///
    /// ```swift
    /// import Foundation
    /// import PhpGlobalHeaderEnv
    ///
    /// private func main() async throws {
    ///     let client = PhpGlobalHeaderEnvClient()
    ///
    ///     _ = try await client.service.getWithApiVersion()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithApiVersion(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/apiVersion",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}