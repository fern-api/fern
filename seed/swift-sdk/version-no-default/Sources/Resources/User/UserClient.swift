import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Version
    ///
    /// private func main() async throws {
    ///     let client = VersionClient()
    ///
    ///     _ = try await client.user.getUser(userId: "userId")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getUser(userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/\(userId)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}