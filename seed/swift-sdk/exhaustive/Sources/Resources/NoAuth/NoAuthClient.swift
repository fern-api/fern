import Foundation

public final class NoAuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// POST request with no auth
    ///
    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.noAuth.postWithNoAuth(request: .object([
    ///         "key": .string("value")
    ///     ]))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithNoAuth(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/no-auth",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}