import Foundation

public final class UrlsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.urls.withMixedCase()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func withMixedCase(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/MixedCase",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.urls.noEndingSlash()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func noEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/no-ending-slash",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.urls.withEndingSlash()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func withEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/with-ending-slash",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.urls.withUnderscores()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func withUnderscores(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/urls/with_underscores",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}