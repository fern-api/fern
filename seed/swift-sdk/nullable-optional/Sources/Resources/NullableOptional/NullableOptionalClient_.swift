import Foundation

public final class NullableOptionalClient_: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Get a user by ID
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getUser(userId: String, requestOptions: RequestOptions? = nil) async throws -> UserResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/\(userId)",
            requestOptions: requestOptions,
            responseType: UserResponse.self
        )
    }

    /// Create a new user
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createUser(request: CreateUserRequest, requestOptions: RequestOptions? = nil) async throws -> UserResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/users",
            body: request,
            requestOptions: requestOptions,
            responseType: UserResponse.self
        )
    }

    /// Update a user (partial update)
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateUser(userId: String, request: UpdateUserRequest, requestOptions: RequestOptions? = nil) async throws -> UserResponse {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/api/users/\(userId)",
            body: request,
            requestOptions: requestOptions,
            responseType: UserResponse.self
        )
    }

    /// List all users
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listUsers(limit: Int? = nil, offset: Int? = nil, includeDeleted: Bool? = nil, sortBy: JSONValue? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users",
            queryParams: [
                "limit": limit.map { .int($0) }, 
                "offset": offset.map { .int($0) }, 
                "includeDeleted": includeDeleted.map { .bool($0) }, 
                "sortBy": sortBy.map { .unknown($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Search users
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func searchUsers(query: String, department: JSONValue, role: String? = nil, isActive: JSONValue? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/search",
            queryParams: [
                "query": .string(query), 
                "department": .unknown(department), 
                "role": role.map { .string($0) }, 
                "isActive": isActive.map { .unknown($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }
}