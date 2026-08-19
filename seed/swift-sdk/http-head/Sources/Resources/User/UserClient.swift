import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import HttpHead
    ///
    /// private func main() async throws {
    ///     let client = HttpHeadClient()
    ///
    ///     _ = try await client.user.head()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func head(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .head,
            path: "/users",
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import HttpHead
    ///
    /// private func main() async throws {
    ///     let client = HttpHeadClient()
    ///
    ///     _ = try await client.user.list(limit: 1)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func list(limit: Int, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "limit": .int(limit)
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}