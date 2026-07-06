import Foundation

public final class HealthServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// This endpoint checks the health of a resource.
    ///
    /// ```swift
    /// import Foundation
    /// import Examples
    /// 
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    /// 
    ///     _ = try await client.health.service.check(id: "id-2sdx82h")
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import Examples
    /// 
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    /// 
    ///     _ = try await client.health.service.ping()
    /// }
    /// 
    /// try await main()
    /// ```
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