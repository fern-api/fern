import Foundation

public final class HealthServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// This endpoint checks the health of a resource.
    ///
    /// - Parameter id: The id to check
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func check(id: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/check/\(id)",
            requestOptions: requestOptions
        )
    }

    /// This endpoint checks the health of the service.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func ping(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get,
            path: "/ping",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}