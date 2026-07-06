import Foundation

public final class TypesClient: Sendable {
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
    ///     _ = try await client.types.get(id: "date-example")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> UnionWithTime {
        return try await httpClient.performRequest(
            method: .get,
            path: "/time/\(id)",
            requestOptions: requestOptions,
            responseType: UnionWithTime.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Unions
    /// 
    /// private func main() async throws {
    ///     let client = UnionsClient()
    /// 
    ///     _ = try await client.types.update(request: UnionWithTime.date(
    ///         CalendarDate("1994-01-01")!
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func update(request: UnionWithTime, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/time",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}