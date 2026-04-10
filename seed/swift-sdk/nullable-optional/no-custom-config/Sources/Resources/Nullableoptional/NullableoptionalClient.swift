import Foundation

public final class NullableoptionalClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Get a user by ID
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getuser(userId: String, requestOptions: RequestOptions? = nil) async throws -> UserResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/\(userId)",
            requestOptions: requestOptions,
            responseType: UserResponse.self
        )
    }

    /// Update a user (partial update)
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateuser(userId: String, request: Requests.UpdateUserRequest, requestOptions: RequestOptions? = nil) async throws -> UserResponse {
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
    public func listusers(limit: Nullable<Int>? = nil, offset: Nullable<Int>? = nil, includeDeleted: Nullable<Bool>? = nil, sortBy: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users",
            queryParams: [
                "limit": limit?.wrappedValue.map { .int($0) }, 
                "offset": offset?.wrappedValue.map { .int($0) }, 
                "includeDeleted": includeDeleted?.wrappedValue.map { .bool($0) }, 
                "sortBy": sortBy?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Create a new user
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createuser(request: Requests.CreateUserRequest, requestOptions: RequestOptions? = nil) async throws -> UserResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/users",
            body: request,
            requestOptions: requestOptions,
            responseType: UserResponse.self
        )
    }

    /// Search users
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func searchusers(query: String, department: Nullable<String>, role: Nullable<String>? = nil, isActive: Nullable<Bool>? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/search",
            queryParams: [
                "query": .string(query), 
                "department": department.wrappedValue.map { .string($0) }, 
                "role": role?.wrappedValue.map { .string($0) }, 
                "isActive": isActive?.wrappedValue.map { .bool($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Create a complex profile to test nullable enums and unions
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createcomplexprofile(request: ComplexProfile, requestOptions: RequestOptions? = nil) async throws -> ComplexProfile {
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
    public func getcomplexprofile(profileId: String, requestOptions: RequestOptions? = nil) async throws -> ComplexProfile {
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
    public func updatecomplexprofile(profileId: String, request: Requests.NullableOptionalUpdateComplexProfileRequest, requestOptions: RequestOptions? = nil) async throws -> ComplexProfile {
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
    public func testdeserialization(request: DeserializationTestRequest, requestOptions: RequestOptions? = nil) async throws -> DeserializationTestResponse {
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
    public func filterbyrole(role: UserRole, status: UserStatus? = nil, secondaryRole: UserRole? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/filter",
            queryParams: [
                "role": .string(role.rawValue), 
                "status": status.map { .string($0.rawValue) }, 
                "secondaryRole": secondaryRole.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Get notification settings which may be null
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getnotificationsettings(userId: String, requestOptions: RequestOptions? = nil) async throws -> NotificationMethod {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/\(userId)/notifications",
            requestOptions: requestOptions,
            responseType: NotificationMethod.self
        )
    }

    /// Update tags to test array handling
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updatetags(userId: String, request: Requests.NullableOptionalUpdateTagsRequest, requestOptions: RequestOptions? = nil) async throws -> [String] {
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
    public func getsearchresults(request: Requests.NullableOptionalGetSearchResultsRequest, requestOptions: RequestOptions? = nil) async throws -> Nullable<[SearchResult]> {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/search",
            body: request,
            requestOptions: requestOptions,
            responseType: Nullable<[SearchResult]>.self
        )
    }
}