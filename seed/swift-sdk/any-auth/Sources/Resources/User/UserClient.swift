import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import AnyAuth
    /// 
    /// private func main() async throws {
    ///     let client = AnyAuthClient(token: "<token>")
    /// 
    ///     _ = try await client.user.get()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import AnyAuth
    /// 
    /// private func main() async throws {
    ///     let client = AnyAuthClient(token: "<token>")
    /// 
    ///     _ = try await client.user.getAdmins()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAdmins(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/admins",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}