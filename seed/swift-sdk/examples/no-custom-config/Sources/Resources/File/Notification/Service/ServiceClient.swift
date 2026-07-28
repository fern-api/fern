import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Examples
    ///
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    ///
    ///     _ = try await client.file.notification.service.getException(notificationId: "notification-hsy129x")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getException(notificationId: String, requestOptions: RequestOptions? = nil) async throws -> Exception {
        return try await httpClient.performRequest(
            method: .get,
            path: "/file/notification/\(notificationId)",
            requestOptions: requestOptions,
            responseType: Exception.self
        )
    }
}