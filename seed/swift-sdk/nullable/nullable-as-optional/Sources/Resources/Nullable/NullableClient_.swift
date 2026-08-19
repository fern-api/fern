import Foundation

public final class NullableClient_: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Nullable
    ///
    /// private func main() async throws {
    ///     let client = NullableClient()
    ///
    ///     _ = try await client.nullable.getUsers(
    ///         usernames: [
    ///             "usernames"
    ///         ],
    ///         avatar: "avatar",
    ///         activated: [
    ///             true
    ///         ],
    ///         tags: [
    ///             .value("tags")
    ///         ],
    ///         extra: .value(true)
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getUsers(usernames: [String]? = nil, avatar: String? = nil, activated: [Bool]? = nil, tags: [Nullable<String>]? = nil, extra: Nullable<Bool>? = nil, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "usernames": usernames.map { .stringArray($0) }, 
                "avatar": avatar.map { .string($0) }, 
                "activated": activated.map { .unknown($0) }, 
                "tags": tags.map { .unknown($0) }, 
                "extra": extra?.wrappedValue.map { .bool($0) }
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Nullable
    ///
    /// private func main() async throws {
    ///     let client = NullableClient()
    ///
    ///     _ = try await client.nullable.createUser(request: .init(
    ///         username: "username",
    ///         tags: [
    ///             "tags",
    ///             "tags"
    ///         ],
    ///         metadata: Metadata(
    ///             createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///             updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///             avatar: .value("avatar"),
    ///             activated: .value(true),
    ///             status: Status.active,
    ///             values: [
    ///                 "values": .value("values")
    ///             ]
    ///         ),
    ///         avatar: .value("avatar")
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
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Nullable
    ///
    /// private func main() async throws {
    ///     let client = NullableClient()
    ///
    ///     _ = try await client.nullable.deleteUser(request: .init(username: .value("xy")))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func deleteUser(request: Requests.DeleteUserRequest, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}