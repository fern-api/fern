import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Variables
    ///
    /// private func main() async throws {
    ///     let client = VariablesClient()
    ///
    ///     _ = try await client.service.post(endpointParam: "<endpointParam>")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func post(endpointParam: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(endpointParam)",
            requestOptions: requestOptions
        )
    }
}