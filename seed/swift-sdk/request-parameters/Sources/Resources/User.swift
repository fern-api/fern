public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createUsername(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getUsername(requestOptions: RequestOptions? = nil) async throws -> User {
        fatalError("Not implemented.")
    }
}