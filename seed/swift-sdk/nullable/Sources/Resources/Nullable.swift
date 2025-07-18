public final class NullableClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUsers(requestOptions: RequestOptions? = nil) throws -> [User] {
    }

    public func createUser(requestOptions: RequestOptions? = nil) throws -> User {
    }

    public func deleteUser(requestOptions: RequestOptions? = nil) throws -> Bool {
    }
}