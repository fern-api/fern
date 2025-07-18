public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUser(requestOptions: RequestOptions? = nil) throws -> User {
    }

    public func createUser(requestOptions: RequestOptions? = nil) throws -> User {
    }

    public func updateUser(requestOptions: RequestOptions? = nil) throws -> User {
    }

    public func searchUsers(requestOptions: RequestOptions? = nil) throws -> [User] {
    }
}