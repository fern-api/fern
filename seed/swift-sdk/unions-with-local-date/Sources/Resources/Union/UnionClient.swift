import Foundation

public final class UnionClient: Sendable {
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
    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> Shape {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(id)",
            requestOptions: requestOptions,
            responseType: Shape.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Unions
    /// 
    /// private func main() async throws {
    ///     let client = UnionsClient()
    /// 
    ///     _ = try await client.union.update(request: Shape.circle(
    ///         Circle(
    ///             radius: 1.1
    ///         )
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func update(request: Shape, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}