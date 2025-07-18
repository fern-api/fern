public final class BClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func foo(requestOptions: RequestOptions? = nil) throws -> Any {
    }
}