public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createUser(request: User, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func createUsersWithListInput(request: [User], requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user/createWithList",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func deleteUser(username: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/user/\(username)",
            requestOptions: requestOptions
        )
    }

    public func getUserByName(username: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user/\(username)",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func loginUser(password: String? = nil, username: String? = nil, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user/login",
            queryParams: [
                "password": password.map { .string($0) }, 
                "username": username.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func logoutUser(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user/logout",
            requestOptions: requestOptions
        )
    }

    public func updateUser(username: String, request: User, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .put,
            path: "/user/\(username)",
            body: request,
            requestOptions: requestOptions
        )
    }
}