public final class NullableClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUsers(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func createUser(requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func deleteUser(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .delete, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }
}