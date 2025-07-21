public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createUsername(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/user/username", 
            requestOptions: requestOptions
        )
    }

    public func getUsername(limit: Int, id: UUID, date: Date, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date? = nil, keyValue: Any, optionalString: String? = nil, nestedUser: NestedUser, optionalUser: User? = nil, excludeUser: User, filter: String, longParam: Int64, bigIntParam: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/user", 
            requestOptions: requestOptions
        )
    }
}