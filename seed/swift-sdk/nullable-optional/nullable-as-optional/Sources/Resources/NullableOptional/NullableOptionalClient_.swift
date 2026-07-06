import Foundation

public final class NullableOptionalClient_: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Get a user by ID
    ///
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.getUser(userId: "userId")
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.createUser(request: CreateUserRequest(
    ///         username: "username",
    ///         email: .value("email"),
    ///         phone: "phone",
    ///         address: .value(Address(
    ///             street: "street",
    ///             city: .value("city"),
    ///             state: "state",
    ///             zipCode: "zipCode",
    ///             country: .value("country"),
    ///             buildingId: .value("buildingId"),
    ///             tenantId: "tenantId"
    ///         ))
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.updateUser(
    ///         userId: "userId",
    ///         request: UpdateUserRequest(
    ///             username: "username",
    ///             email: .value("email"),
    ///             phone: "phone",
    ///             address: .value(Address(
    ///                 street: "street",
    ///                 city: .value("city"),
    ///                 state: "state",
    ///                 zipCode: "zipCode",
    ///                 country: .value("country"),
    ///                 buildingId: .value("buildingId"),
    ///                 tenantId: "tenantId"
    ///             ))
    ///         )
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.listUsers(
    ///         limit: 1,
    ///         offset: 1,
    ///         includeDeleted: true,
    ///         sortBy: .value("sortBy")
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listUsers(limit: Int? = nil, offset: Int? = nil, includeDeleted: Bool? = nil, sortBy: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users",
            queryParams: [
                "limit": limit.map { .int($0) }, 
                "offset": offset.map { .int($0) }, 
                "includeDeleted": includeDeleted.map { .bool($0) }, 
                "sortBy": sortBy?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Search users
    ///
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.searchUsers(
    ///         query: "query",
    ///         department: .value("department"),
    ///         role: "role",
    ///         isActive: .value(true)
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func searchUsers(query: String, department: Nullable<String>, role: String? = nil, isActive: Nullable<Bool>? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/search",
            queryParams: [
                "query": .string(query), 
                "department": department.wrappedValue.map { .string($0) }, 
                "role": role.map { .string($0) }, 
                "isActive": isActive?.wrappedValue.map { .bool($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Create a complex profile to test nullable enums and unions
    ///
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.createComplexProfile(request: ComplexProfile(
    ///         id: "id",
    ///         nullableRole: .value(.admin),
    ///         optionalRole: .admin,
    ///         optionalNullableRole: .value(.admin),
    ///         nullableStatus: .value(.active),
    ///         optionalStatus: .active,
    ///         optionalNullableStatus: .value(.active),
    ///         nullableNotification: .value(NotificationMethod.email(
    ///             EmailNotification(
    ///                 emailAddress: "emailAddress",
    ///                 subject: "subject",
    ///                 htmlContent: "htmlContent"
    ///             )
    ///         )),
    ///         optionalNotification: NotificationMethod.email(
    ///             EmailNotification(
    ///                 emailAddress: "emailAddress",
    ///                 subject: "subject",
    ///                 htmlContent: "htmlContent"
    ///             )
    ///         ),
    ///         optionalNullableNotification: .value(NotificationMethod.email(
    ///             EmailNotification(
    ///                 emailAddress: "emailAddress",
    ///                 subject: "subject",
    ///                 htmlContent: "htmlContent"
    ///             )
    ///         )),
    ///         nullableSearchResult: .value(SearchResult.user(
    ///             UserResponse(
    ///                 id: "id",
    ///                 username: "username",
    ///                 email: .value("email"),
    ///                 phone: "phone",
    ///                 createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///                 updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
    ///                 address: Address(
    ///                     street: "street",
    ///                     city: .value("city"),
    ///                     state: "state",
    ///                     zipCode: "zipCode",
    ///                     country: .value("country"),
    ///                     buildingId: .value("buildingId"),
    ///                     tenantId: "tenantId"
    ///                 )
    ///             )
    ///         )),
    ///         optionalSearchResult: SearchResult.user(
    ///             UserResponse(
    ///                 id: "id",
    ///                 username: "username",
    ///                 email: .value("email"),
    ///                 phone: "phone",
    ///                 createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///                 updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
    ///                 address: Address(
    ///                     street: "street",
    ///                     city: .value("city"),
    ///                     state: "state",
    ///                     zipCode: "zipCode",
    ///                     country: .value("country"),
    ///                     buildingId: .value("buildingId"),
    ///                     tenantId: "tenantId"
    ///                 )
    ///             )
    ///         ),
    ///         nullableArray: .value([
    ///             "nullableArray",
    ///             "nullableArray"
    ///         ]),
    ///         optionalArray: [
    ///             "optionalArray",
    ///             "optionalArray"
    ///         ],
    ///         optionalNullableArray: .value([
    ///             "optionalNullableArray",
    ///             "optionalNullableArray"
    ///         ]),
    ///         nullableListOfNullables: .value([
    ///             .value("nullableListOfNullables"),
    ///             .value("nullableListOfNullables")
    ///         ]),
    ///         nullableMapOfNullables: .value([
    ///             "nullableMapOfNullables": .value(Address(
    ///                 street: "street",
    ///                 city: .value("city"),
    ///                 state: "state",
    ///                 zipCode: "zipCode",
    ///                 country: .value("country"),
    ///                 buildingId: .value("buildingId"),
    ///                 tenantId: "tenantId"
    ///             ))
    ///         ]),
    ///         nullableListOfUnions: .value([
    ///             NotificationMethod.email(
    ///                 EmailNotification(
    ///                     emailAddress: "emailAddress",
    ///                     subject: "subject",
    ///                     htmlContent: "htmlContent"
    ///                 )
    ///             ),
    ///             NotificationMethod.email(
    ///                 EmailNotification(
    ///                     emailAddress: "emailAddress",
    ///                     subject: "subject",
    ///                     htmlContent: "htmlContent"
    ///                 )
    ///             )
    ///         ]),
    ///         optionalMapOfEnums: [
    ///             "optionalMapOfEnums": .admin
    ///         ]
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.getComplexProfile(profileId: "profileId")
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.updateComplexProfile(
    ///         profileId: "profileId",
    ///         request: .init(
    ///             nullableRole: .value(.admin),
    ///             nullableStatus: .value(.active),
    ///             nullableNotification: .value(NotificationMethod.email(
    ///                 EmailNotification(
    ///                     emailAddress: "emailAddress",
    ///                     subject: "subject",
    ///                     htmlContent: "htmlContent"
    ///                 )
    ///             )),
    ///             nullableSearchResult: .value(SearchResult.user(
    ///                 UserResponse(
    ///                     id: "id",
    ///                     username: "username",
    ///                     email: .value("email"),
    ///                     phone: "phone",
    ///                     createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///                     updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
    ///                     address: Address(
    ///                         street: "street",
    ///                         city: .value("city"),
    ///                         state: "state",
    ///                         zipCode: "zipCode",
    ///                         country: .value("country"),
    ///                         buildingId: .value("buildingId"),
    ///                         tenantId: "tenantId"
    ///                     )
    ///                 )
    ///             )),
    ///             nullableArray: .value([
    ///                 "nullableArray",
    ///                 "nullableArray"
    ///             ])
    ///         )
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.testDeserialization(request: DeserializationTestRequest(
    ///         requiredString: "requiredString",
    ///         nullableString: .value("nullableString"),
    ///         optionalString: "optionalString",
    ///         optionalNullableString: .value("optionalNullableString"),
    ///         nullableEnum: .value(.admin),
    ///         optionalEnum: .active,
    ///         nullableUnion: .value(NotificationMethod.email(
    ///             EmailNotification(
    ///                 emailAddress: "emailAddress",
    ///                 subject: "subject",
    ///                 htmlContent: "htmlContent"
    ///             )
    ///         )),
    ///         optionalUnion: SearchResult.user(
    ///             UserResponse(
    ///                 id: "id",
    ///                 username: "username",
    ///                 email: .value("email"),
    ///                 phone: "phone",
    ///                 createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///                 updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
    ///                 address: Address(
    ///                     street: "street",
    ///                     city: .value("city"),
    ///                     state: "state",
    ///                     zipCode: "zipCode",
    ///                     country: .value("country"),
    ///                     buildingId: .value("buildingId"),
    ///                     tenantId: "tenantId"
    ///                 )
    ///             )
    ///         ),
    ///         nullableList: .value([
    ///             "nullableList",
    ///             "nullableList"
    ///         ]),
    ///         nullableMap: .value([
    ///             "nullableMap": 1
    ///         ]),
    ///         nullableObject: .value(Address(
    ///             street: "street",
    ///             city: .value("city"),
    ///             state: "state",
    ///             zipCode: "zipCode",
    ///             country: .value("country"),
    ///             buildingId: .value("buildingId"),
    ///             tenantId: "tenantId"
    ///         )),
    ///         optionalObject: Organization(
    ///             id: "id",
    ///             name: "name",
    ///             domain: .value("domain"),
    ///             employeeCount: 1
    ///         )
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.filterByRole(
    ///         role: .value(.admin),
    ///         status: .active,
    ///         secondaryRole: .value(.admin)
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func filterByRole(role: Nullable<UserRole>, status: UserStatus? = nil, secondaryRole: Nullable<UserRole>? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserResponse] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/filter",
            queryParams: [
                "role": role.wrappedValue.map { .string($0.rawValue) }, 
                "status": status.map { .string($0.rawValue) }, 
                "secondaryRole": secondaryRole?.wrappedValue.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: [UserResponse].self
        )
    }

    /// Get notification settings which may be null
    ///
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.getNotificationSettings(userId: "userId")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getNotificationSettings(userId: String, requestOptions: RequestOptions? = nil) async throws -> Nullable<NotificationMethod> {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/\(userId)/notifications",
            requestOptions: requestOptions,
            responseType: Nullable<NotificationMethod>.self
        )
    }

    /// Update tags to test array handling
    ///
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.updateTags(
    ///         userId: "userId",
    ///         request: .init(
    ///             tags: .value([
    ///                 "tags",
    ///                 "tags"
    ///             ]),
    ///             categories: [
    ///                 "categories",
    ///                 "categories"
    ///             ],
    ///             labels: .value([
    ///                 "labels",
    ///                 "labels"
    ///             ])
    ///         )
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
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
    /// ```swift
    /// import Foundation
    /// import NullableOptional
    /// 
    /// private func main() async throws {
    ///     let client = NullableOptionalClient()
    /// 
    ///     _ = try await client.nullableOptional.getSearchResults(request: .init(
    ///         query: "query",
    ///         filters: [
    ///             "filters": .value("filters")
    ///         ],
    ///         includeTypes: .value([
    ///             "includeTypes",
    ///             "includeTypes"
    ///         ])
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getSearchResults(request: Requests.SearchRequest, requestOptions: RequestOptions? = nil) async throws -> Nullable<[SearchResult]> {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/search",
            body: request,
            requestOptions: requestOptions,
            responseType: Nullable<[SearchResult]>.self
        )
    }
}