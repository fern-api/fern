import Foundation

public final class ApiClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import InferredAuthExplicit
    /// 
    /// private func main() async throws {
    ///     let client = InferredAuthExplicitClient()
    /// 
    ///     _ = try await client.nestedNoAuth.api.getSomething()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getSomething(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/nested-no-auth/get-something",
            requestOptions: requestOptions
        )
    }
}