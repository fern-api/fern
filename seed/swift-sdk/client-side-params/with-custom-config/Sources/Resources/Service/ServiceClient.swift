import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// List resources with pagination
    ///
    /// - Parameter page: Zero-indexed page number
    /// - Parameter perPage: Number of items per page
    /// - Parameter sort: Sort field
    /// - Parameter order: Sort order (asc or desc)
    /// - Parameter includeTotals: Whether to include total count
    /// - Parameter fields: Comma-separated list of fields to include
    /// - Parameter search: Search query
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listresources(page: Int, perPage: Int, sort: String, order: String, includeTotals: Bool, fields: Nullable<String>? = nil, search: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> [Resource] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/resources",
            queryParams: [
                "page": .int(page), 
                "per_page": .int(perPage), 
                "sort": .string(sort), 
                "order": .string(order), 
                "include_totals": .bool(includeTotals), 
                "fields": fields?.wrappedValue.map { .string($0) }, 
                "search": search?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Resource].self
        )
    }

    /// Get a single resource
    ///
    /// - Parameter includeMetadata: Include metadata in response
    /// - Parameter format: Response format
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getresource(resourceId: String, includeMetadata: Bool, format: String, requestOptions: RequestOptions? = nil) async throws -> Resource {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/resources/\(resourceId)",
            queryParams: [
                "include_metadata": .bool(includeMetadata), 
                "format": .string(format)
            ],
            requestOptions: requestOptions,
            responseType: Resource.self
        )
    }

    /// Search resources with complex parameters
    ///
    /// - Parameter limit: Maximum results to return
    /// - Parameter offset: Offset for pagination
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func searchresources(limit: Int, offset: Int, request: Requests.ServiceSearchResourcesRequest, requestOptions: RequestOptions? = nil) async throws -> SearchResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/resources/search",
            queryParams: [
                "limit": .int(limit), 
                "offset": .int(offset)
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: SearchResponse.self
        )
    }

    /// List or search for users
    ///
    /// - Parameter page: Page index of the results to return. First page is 0.
    /// - Parameter perPage: Number of results per page.
    /// - Parameter includeTotals: Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    /// - Parameter sort: Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    /// - Parameter connection: Connection filter
    /// - Parameter q: Query string following Lucene query string syntax
    /// - Parameter searchEngine: Search engine version (v1, v2, or v3)
    /// - Parameter fields: Comma-separated list of fields to include or exclude
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listusers(page: Nullable<Int>? = nil, perPage: Nullable<Int>? = nil, includeTotals: Nullable<Bool>? = nil, sort: Nullable<String>? = nil, connection: Nullable<String>? = nil, q: Nullable<String>? = nil, searchEngine: Nullable<String>? = nil, fields: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> PaginatedUserResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "per_page": perPage?.wrappedValue.map { .int($0) }, 
                "include_totals": includeTotals?.wrappedValue.map { .bool($0) }, 
                "sort": sort?.wrappedValue.map { .string($0) }, 
                "connection": connection?.wrappedValue.map { .string($0) }, 
                "q": q?.wrappedValue.map { .string($0) }, 
                "search_engine": searchEngine?.wrappedValue.map { .string($0) }, 
                "fields": fields?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: PaginatedUserResponse.self
        )
    }

    /// Create a new user
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createuser(request: Requests.CreateUserRequest, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/api/users",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    /// Get a user by ID
    ///
    /// - Parameter fields: Comma-separated list of fields to include or exclude
    /// - Parameter includeFields: true to include the fields specified, false to exclude them
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getuserbyid(userId: String, fields: Nullable<String>? = nil, includeFields: Nullable<Bool>? = nil, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/users/\(userId)",
            queryParams: [
                "fields": fields?.wrappedValue.map { .string($0) }, 
                "include_fields": includeFields?.wrappedValue.map { .bool($0) }
            ],
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    /// Delete a user
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func deleteuser(userId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/api/users/\(userId)",
            requestOptions: requestOptions
        )
    }

    /// Update a user
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateuser(userId: String, request: Requests.UpdateUserRequest, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/api/users/\(userId)",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    /// List all connections
    ///
    /// - Parameter strategy: Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    /// - Parameter name: Filter by connection name
    /// - Parameter fields: Comma-separated list of fields to include
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listconnections(strategy: Nullable<String>? = nil, name: Nullable<String>? = nil, fields: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> [Connection] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/connections",
            queryParams: [
                "strategy": strategy?.wrappedValue.map { .string($0) }, 
                "name": name?.wrappedValue.map { .string($0) }, 
                "fields": fields?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Connection].self
        )
    }

    /// Get a connection by ID
    ///
    /// - Parameter fields: Comma-separated list of fields to include
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getconnection(connectionId: String, fields: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> Connection {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/connections/\(connectionId)",
            queryParams: [
                "fields": fields?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: Connection.self
        )
    }

    /// List all clients/applications
    ///
    /// - Parameter fields: Comma-separated list of fields to include
    /// - Parameter includeFields: Whether specified fields are included or excluded
    /// - Parameter page: Page number (zero-based)
    /// - Parameter perPage: Number of results per page
    /// - Parameter includeTotals: Include total count in response
    /// - Parameter isGlobal: Filter by global clients
    /// - Parameter isFirstParty: Filter by first party clients
    /// - Parameter appType: Filter by application type (spa, native, regular_web, non_interactive)
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listclients(fields: Nullable<String>? = nil, includeFields: Nullable<Bool>? = nil, page: Nullable<Int>? = nil, perPage: Nullable<Int>? = nil, includeTotals: Nullable<Bool>? = nil, isGlobal: Nullable<Bool>? = nil, isFirstParty: Nullable<Bool>? = nil, appType: Nullable<[String]>? = nil, requestOptions: RequestOptions? = nil) async throws -> PaginatedClientResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/clients",
            queryParams: [
                "fields": fields?.wrappedValue.map { .string($0) }, 
                "include_fields": includeFields?.wrappedValue.map { .bool($0) }, 
                "page": page?.wrappedValue.map { .int($0) }, 
                "per_page": perPage?.wrappedValue.map { .int($0) }, 
                "include_totals": includeTotals?.wrappedValue.map { .bool($0) }, 
                "is_global": isGlobal?.wrappedValue.map { .bool($0) }, 
                "is_first_party": isFirstParty?.wrappedValue.map { .bool($0) }, 
                "app_type": appType?.wrappedValue.map { .stringArray($0) }
            ],
            requestOptions: requestOptions,
            responseType: PaginatedClientResponse.self
        )
    }

    /// Get a client by ID
    ///
    /// - Parameter fields: Comma-separated list of fields to include
    /// - Parameter includeFields: Whether specified fields are included or excluded
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getclient(clientId: String, fields: Nullable<String>? = nil, includeFields: Nullable<Bool>? = nil, requestOptions: RequestOptions? = nil) async throws -> Client {
        return try await httpClient.performRequest(
            method: .get,
            path: "/api/clients/\(clientId)",
            queryParams: [
                "fields": fields?.wrappedValue.map { .string($0) }, 
                "include_fields": includeFields?.wrappedValue.map { .bool($0) }
            ],
            requestOptions: requestOptions,
            responseType: Client.self
        )
    }
}