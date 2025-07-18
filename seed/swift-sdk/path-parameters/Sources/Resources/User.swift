public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUser(requestOptions: RequestOptions? = nil) async throws -> User {
        fatalError("Not implemented.")
    }

    public func createUser(requestOptions: RequestOptions? = nil) async throws -> User {
        fatalError("Not implemented.")
    }

    public func updateUser(requestOptions: RequestOptions? = nil) async throws -> User {
        fatalError("Not implemented.")
    }

    public func searchUsers(requestOptions: RequestOptions? = nil) async throws -> [User] {
        fatalError("Not implemented.")
    }
}