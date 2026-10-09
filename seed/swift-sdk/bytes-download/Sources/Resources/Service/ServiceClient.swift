import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import BytesDownload
    ///
    /// private func main() async throws {
    ///     let client = BytesDownloadClient()
    ///
    ///     _ = try await client.service.simple()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func simple(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/snippet",
            requestOptions: requestOptions
        )
    }

    public func download(id: String, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .get,
            path: "/download-content/\(id)",
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }
}