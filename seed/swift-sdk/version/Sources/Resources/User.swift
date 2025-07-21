public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUser(requestOptions: RequestOptions? = nil) async throws -> User {
        fatalError("Not implemented.")
    }
}