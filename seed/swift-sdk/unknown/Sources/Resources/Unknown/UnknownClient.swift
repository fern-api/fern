import Foundation

public final class UnknownClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import UnknownAsAny
    /// 
    /// private func main() async throws {
    ///     let client = UnknownAsAnyClient()
    /// 
    ///     _ = try await client.unknown.post(request: .object([
    ///         "key": .string("value")
    ///     ]))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func post(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> [JSONValue] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: [JSONValue].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import UnknownAsAny
    /// 
    /// private func main() async throws {
    ///     let client = UnknownAsAnyClient()
    /// 
    ///     _ = try await client.unknown.postObject(request: MyObject(
    ///         unknown: .object([
    ///             "key": .string("value")
    ///         ])
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postObject(request: MyObject, requestOptions: RequestOptions? = nil) async throws -> [JSONValue] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-object",
            body: request,
            requestOptions: requestOptions,
            responseType: [JSONValue].self
        )
    }
}