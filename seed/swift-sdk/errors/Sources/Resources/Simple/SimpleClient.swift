import Foundation

public final class SimpleClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Errors
    /// 
    /// private func main() async throws {
    ///     let client = ErrorsClient()
    /// 
    ///     _ = try await client.simple.fooWithoutEndpointError(request: FooRequest(
    ///         bar: "bar"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func fooWithoutEndpointError(request: FooRequest, requestOptions: RequestOptions? = nil) async throws -> FooResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo1",
            body: request,
            requestOptions: requestOptions,
            responseType: FooResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Errors
    /// 
    /// private func main() async throws {
    ///     let client = ErrorsClient()
    /// 
    ///     _ = try await client.simple.foo(request: FooRequest(
    ///         bar: "bar"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func foo(request: FooRequest, requestOptions: RequestOptions? = nil) async throws -> FooResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo2",
            body: request,
            requestOptions: requestOptions,
            responseType: FooResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Errors
    /// 
    /// private func main() async throws {
    ///     let client = ErrorsClient()
    /// 
    ///     _ = try await client.simple.fooWithExamples(request: FooRequest(
    ///         bar: "hello"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func fooWithExamples(request: FooRequest, requestOptions: RequestOptions? = nil) async throws -> FooResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo3",
            body: request,
            requestOptions: requestOptions,
            responseType: FooResponse.self
        )
    }
}