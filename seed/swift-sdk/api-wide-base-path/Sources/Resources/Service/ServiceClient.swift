import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import ApiWideBasePath
    ///
    /// private func main() async throws {
    ///     let client = ApiWideBasePathClient()
    ///
    ///     _ = try await client.service.post(
    ///         pathParam: "pathParam",
    ///         serviceParam: "serviceParam",
    ///         endpointParam: "1",
    ///         resourceParam: "resourceParam"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func post(pathParam: String, serviceParam: String, endpointParam: String, resourceParam: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/test/\(pathParam)/\(serviceParam)/\(endpointParam)/\(resourceParam)",
            requestOptions: requestOptions
        )
    }
}