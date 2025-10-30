import Foundation

public final class NullableOptionalClient_: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
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
    public func listUsers(limit: Int? = nil, offset: Int? = nil, includeDeleted: Bool? = nil, sortBy: String? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users",
            queryParams: [
                "limit": limit.map { .int($0) }, 
                "offset": offset.map { .int($0) }, 
                "includeDeleted": includeDeleted.map { .bool($0) }, 
                "sortBy": sortBy.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Search users
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func searchUsers(query: String, department: String? = nil, role: String? = nil, isActive: Bool? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/search",
            queryParams: [
                "query": .string(query), 
                "department": department.map { .string($0) }, 
                "role": role.map { .string($0) }, 
                "isActive": isActive.map { .bool($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Create a complex profile to test nullable enums and unions
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createComplexProfile(request: ComplexProfile, requestOptions: RequestOptions? = nil) async throws -> ComplexProfile {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/profiles/complex",
            body: request,
            requestOptions: requestOptions,
            responseType: ComplexProfile.self
        )
    }

    /// Get a complex profile by ID
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getComplexProfile(profileId: String, requestOptions: RequestOptions? = nil) async throws -> ComplexProfile {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/profiles/complex/\(profileId)",
            requestOptions: requestOptions,
            responseType: ComplexProfile.self
        )
    }

    /// Update complex profile to test nullable field updates
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateComplexProfile(profileId: String, request: Requests.UpdateComplexProfileRequest, requestOptions: RequestOptions? = nil) async throws -> ComplexProfile {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/api/profiles/complex/\(profileId)",
            body: request,
            requestOptions: requestOptions,
            responseType: ComplexProfile.self
        )
    }

    /// Test endpoint for validating null deserialization
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func testDeserialization(request: DeserializationTestRequest, requestOptions: RequestOptions? = nil) async throws -> DeserializationTestResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/test/deserialization",
            body: request,
            requestOptions: requestOptions,
            responseType: DeserializationTestResponse.self
        )
    }

    /// Filter users by role with nullable enum
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func filterByRole(role: UserRole? = nil, status: UserStatus? = nil, secondaryRole: UserRole? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/filter",
            queryParams: [
                "role": role.map { .unknown($0.rawValue) }, 
                "status": status.map { .unknown($0.rawValue) }, 
                "secondaryRole": secondaryRole.map { .unknown($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Get notification settings which may be null
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getNotificationSettings(userId: String, requestOptions: RequestOptions? = nil) async throws -> NotificationMethod? {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/\(userId)/notifications",
            requestOptions: requestOptions,
            responseType: NotificationMethod?.self
        )
    }

    /// Update tags to test array handling
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateTags(userId: String, request: Requests.UpdateTagsRequest, requestOptions: RequestOptions? = nil) async throws -> [String] {
        return try await httpClient.performRequest(
            method: .put,
            path: "/api/users/\(userId)/tags",
            body: request,
            requestOptions: requestOptions,
            responseType: [String].self
        )
    }

    /// Get search results with nullable unions
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getSearchResults(request: Requests.SearchRequest, requestOptions: RequestOptions? = nil) async throws -> [SearchResult]? {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/search",
            body: request,
            requestOptions: requestOptions,
            responseType: [SearchResult]?.self
        )
    }
}