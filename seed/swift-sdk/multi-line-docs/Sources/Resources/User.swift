public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUser(userId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users/\(userId)", 
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
}