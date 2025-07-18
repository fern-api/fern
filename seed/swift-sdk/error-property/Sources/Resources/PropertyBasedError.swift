public final class PropertyBasedErrorClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func throwError(requestOptions: RequestOptions? = nil) throws -> String {
    }
}