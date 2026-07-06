import Foundation

public final class PropertyBasedErrorClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET request that always throws an error
    ///
    /// ```swift
    /// import Foundation
    /// import ErrorProperty
    /// 
    /// private func main() async throws {
    ///     let client = ErrorPropertyClient()
    /// 
    ///     _ = try await client.propertyBasedError.throwError()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func throwError(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/property-based-error",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}