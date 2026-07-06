import Foundation

public final class BasicAuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET request with basic auth scheme
    ///
    /// ```swift
    /// import Foundation
    /// import BasicAuthPwOmitted
    /// 
    /// private func main() async throws {
    ///     let client = BasicAuthPwOmittedClient(
    ///         username: "<username>",
    ///         password: ""
    ///     )
    /// 
    ///     _ = try await client.basicAuth.getWithBasicAuth()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithBasicAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get,
            path: "/basic-auth",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    /// POST request with basic auth scheme
    ///
    /// ```swift
    /// import Foundation
    /// import BasicAuthPwOmitted
    /// 
    /// private func main() async throws {
    ///     let client = BasicAuthPwOmittedClient(
    ///         username: "<username>",
    ///         password: ""
    ///     )
    /// 
    ///     _ = try await client.basicAuth.postWithBasicAuth(request: .object([
    ///         "key": .string("value")
    ///     ]))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithBasicAuth(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/basic-auth",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}