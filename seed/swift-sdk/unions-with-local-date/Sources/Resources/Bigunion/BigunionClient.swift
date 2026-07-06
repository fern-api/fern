import Foundation

public final class BigunionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Unions
    ///
    /// private func main() async throws {
    ///     let client = UnionsClient()
    ///
    ///     _ = try await client.bigunion.get(id: "id")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> BigUnion {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(id)",
            requestOptions: requestOptions,
            responseType: BigUnion.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Unions
    ///
    /// private func main() async throws {
    ///     let client = UnionsClient()
    ///
    ///     _ = try await client.bigunion.update(request: BigUnion.normalSweet(
    ///         NormalSweet(
    ///             value: "value"
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func update(request: BigUnion, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Unions
    ///
    /// private func main() async throws {
    ///     let client = UnionsClient()
    ///
    ///     _ = try await client.bigunion.updateMany(request: [
    ///         BigUnion.normalSweet(
    ///             NormalSweet(
    ///                 value: "value"
    ///             )
    ///         ),
    ///         BigUnion.normalSweet(
    ///             NormalSweet(
    ///                 value: "value"
    ///             )
    ///         )
    ///     ])
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateMany(request: [BigUnion], requestOptions: RequestOptions? = nil) async throws -> [String: Bool] {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/many",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: Bool].self
        )
    }
}