public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func head(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func list(requestOptions: RequestOptions? = nil) async throws -> [User] {
    }
}