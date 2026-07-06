import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import SimpleApi
    /// 
    /// private func main() async throws {
    ///     let client = SimpleApiClient(token: "<token>")
    /// 
    ///     _ = try await client.user.get(id: "id")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/\(id)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}