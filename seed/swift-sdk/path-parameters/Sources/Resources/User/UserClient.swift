import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getuser(tenantId: String, userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/user/\(userId)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func updateuser(tenantId: String, userId: String, request: User, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/\(tenantId)/user/\(userId)",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func createuser(tenantId: String, request: User, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(tenantId)/user",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func searchusers(tenantId: String, userId: String, limit: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/user/\(userId)/search",
            queryParams: [
                "limit": limit?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// Test endpoint with path parameter that has a text prefix (v{version})
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getusermetadata(tenantId: String, userId: String, version: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/user/\(userId)/metadata/v\(version)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    /// Test endpoint with path parameters listed in different order than found in path
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getuserspecifics(tenantId: String, userId: String, version: String, thought: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(tenantId)/user/\(userId)/specifics/\(version)/\(thought)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}