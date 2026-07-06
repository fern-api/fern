import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import ExtraProperties
    /// 
    /// private func main() async throws {
    ///     let client = ExtraPropertiesClient()
    /// 
    ///     _ = try await client.user.createUser(request: .init(
    ///         type: .createUserRequest,
    ///         version: .v1,
    ///         name: "Alice"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createUser(request: Requests.CreateUserRequest, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}