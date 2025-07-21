public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUser(tenantId: String, userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/\(tenantId)/user/\(userId)", 
            requestOptions: requestOptions
        )
    }

    public func createUser(tenantId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/\(tenantId)/user", 
            requestOptions: requestOptions
        )
    }

    public func updateUser(tenantId: String, userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .patch, 
            path: "/\(tenantId)/user/\(userId)", 
            requestOptions: requestOptions
        )
    }

    public func searchUsers(tenantId: String, userId: String, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/\(tenantId)/user/\(userId)/search", 
            requestOptions: requestOptions
        )
    }
}