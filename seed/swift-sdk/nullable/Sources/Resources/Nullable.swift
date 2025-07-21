public final class NullableClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUsers(requestOptions: RequestOptions? = nil) async throws -> [User] {
        fatalError("Not implemented.")
    }

    public func createUser(requestOptions: RequestOptions? = nil) async throws -> User {
        fatalError("Not implemented.")
    }

    public func deleteUser(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }
}