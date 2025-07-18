public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listUsernamesCustom(requestOptions: RequestOptions? = nil) throws -> UsernameCursor {
    }
}